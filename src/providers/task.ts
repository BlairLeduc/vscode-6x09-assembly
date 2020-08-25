import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ConfigurationManager, Command, OSPlatform } from '../managers/configuration';
import { getOSPlatform } from '../utilities';

interface TaskDefinition extends vscode.TaskDefinition {
    /** The task to perform */
    command: string;

    /** The path of the file that the command will use. */
    file: string;
}

export class TaskProvider implements vscode.TaskProvider {
    private lwasmPath: string;
    private lwasmArgs: string[];
    private xroarPath: string;
    private xroarArgs: string[];
    private platform: OSPlatform;

    constructor(private configurationManager: ConfigurationManager) {
        this.platform = getOSPlatform();
        this.readConfiguration();

        configurationManager.onDidChangeConfiguration(() => {
            this.readConfiguration();
        });
    }

    public provideTasks(_?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
        return this.getAssemblyFileTasks();
    }

    public resolveTask(task: vscode.Task, _?: vscode.CancellationToken): vscode.ProviderResult<vscode.Task> {
        const definition = task.definition as TaskDefinition;
        let newTask: vscode.Task = undefined;
        if (definition.type == "asm6x09") {
            switch (definition.command) {
                case 'lwasm':
                    newTask = this.createLwasmAssembleTask(definition.file, this.lwasmArgs);
                    break;
                case 'xroar':
                    newTask = this.createXRoarRunTask(definition.file, this.xroarArgs);
                    break;
                default:
                    newTask = undefined;
            }
        }

        return newTask;
    }

    private readConfiguration(): void {
        this.lwasmPath = this.configurationManager.getPath(Command.lwasm, this.platform);
        this.lwasmArgs = this.configurationManager.getArgs(Command.lwasm).split(' ');
        this.xroarPath = this.configurationManager.getPath(Command.xroar, this.platform);
        this.xroarArgs = this.configurationManager.getArgs(Command.xroar).split(' ');
    }

    private getAssemblyFileTasks(): Promise<vscode.Task[]> {
        return new Promise(resolve => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const result: vscode.Task[] = [];

            if (!workspaceFolders || workspaceFolders.length == 0) {
                return result;
            }

            for (const workspaceFolder of workspaceFolders) {
                const folder = workspaceFolder.uri.fsPath;
                if (!folder) {
                    continue;
                }
                for (const file of fs.readdirSync(folder)) {
                    if (['.asm', '.s'].includes(path.extname(file))) {
                        result.push(this.createLwasmAssembleTask(file, this.lwasmArgs));
                    }
                }
            }

            resolve(result);
        });
    }

    private createLwasmAssembleTask(filePath: string, args: string[]): vscode.Task {
        const filename = this.getFileNoExt(filePath);

        return new vscode.Task(
            { type: 'asm6x09', command: 'lwasm', file: filePath, arguments: args.join(' ') },
            vscode.TaskScope.Workspace,
            `assemble ${path.basename(filePath)}`,
            'lwasm',
            new vscode.ProcessExecution(this.lwasmPath, [
                ...args,
                '-b', // decb format
                filePath,
                `-o${filename}.bin`,
                `--map=${filename}.map`
            ]),
            '$lwasm' // problem matcher
        );
    }

    private createXRoarRunTask(filePath: string, args: string[]): vscode.Task {
        return new vscode.Task(
            { type: 'asm6x09', command: 'xroar', file: filePath, arguments: args.join(' ') },
            'run',
            'xroar',
            new vscode.ProcessExecution(this.xroarPath, [
                ...args,
                '-run',
                filePath
            ])
        );
    }

    private getFileNoExt(filePath: string): string {
        const file = path.parse(filePath);
        return path.join(file.dir, file.name);
    }
}