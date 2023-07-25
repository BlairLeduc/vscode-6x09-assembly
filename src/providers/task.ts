import * as path from 'path';
import * as vscode from 'vscode';
import {
  ConfigurationManager,
  Command,
  CommandConfiguration,
  OSPlatform
} from '../managers';
import { getOSPlatform } from '../utilities';
import { ASM6X09_FILE_EXTENSIONS } from '../common';

interface TaskDefinition extends vscode.TaskDefinition {
  /** The task to perform */
  command: string;

  /** The path of the file that the command will use. */
  file: string;
}

export class TaskProvider implements vscode.TaskProvider {
  private lwasmConfig?: CommandConfiguration;
  private xroarConfig?: CommandConfiguration;
  private platform: OSPlatform;

  constructor(private configurationManager: ConfigurationManager) {
    this.platform = getOSPlatform();
    this.readConfiguration();

    configurationManager.onDidChangeConfiguration(() => {
      this.readConfiguration();
    });
  }

  public async provideTasks(
    _token?: vscode.CancellationToken): Promise<vscode.Task[] | undefined> {

    return await this.getAssemblyFileTasks();
  }

  public async resolveTask(
    task: vscode.Task,
    cancellationToken?: vscode.CancellationToken): Promise<vscode.Task | undefined> {

    if (!cancellationToken?.isCancellationRequested) {
      const definition = task.definition as TaskDefinition;
      let newTask: vscode.Task | undefined = undefined;

      if (definition.type === "asm6x09") {
        switch (definition.command) {
          case 'lwasm':
            newTask = this.createLwasmAssembleTask(
              definition.file,
              this.argsAsArray(this.lwasmConfig?.arguments));
            break;
          case 'xroar':
            newTask = this.createXRoarRunTask(
              definition.file,
              this.argsAsArray(this.xroarConfig?.arguments));
            break;
          default:
            newTask = undefined;
        }
      }

      return newTask;
    }
  }

  private argsAsArray(args?: string): string[] {
    return args?.split(' ') ?? [];
  }

  private getPathForPlatform(config?: CommandConfiguration): string {
    if (!config) {
      return '';
    }

    switch (this.platform) {
      case OSPlatform.windows:
        return config.path.windows;
      case OSPlatform.macOS:
        return config.path.macOS;
      case OSPlatform.linux:
        return config.path.linux;
    }
  }

  private readConfiguration(): void {
    this.lwasmConfig = this.configurationManager.getCommandConfiguration(Command.lwasm);
    this.xroarConfig = this.configurationManager.getCommandConfiguration(Command.xroar);
  }

  private async getAssemblyFileTasks(): Promise<vscode.Task[] | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const result: vscode.Task[] = [];

    if (!workspaceFolders || workspaceFolders.length === 0) {
      return result;
    }

    for (const workspaceFolder of workspaceFolders) {
      const folder = workspaceFolder.uri;

      if (!folder) {
        continue;
      }

      for (const file of await vscode.workspace.fs.readDirectory(folder)) {
        if (ASM6X09_FILE_EXTENSIONS.includes(path.extname(file[0]))) {
          result.push(this.createLwasmAssembleTask(
            file[0],
            this.argsAsArray(this.lwasmConfig?.arguments)));
        }
      }
    }

    return result;
  }

  private createLwasmAssembleTask(filePath: string, args: string[]): vscode.Task {
    const filename = this.getFileNoExt(filePath);

    return new vscode.Task(
      {
        type: 'asm6x09',
        command: 'lwasm',
        file: filePath,
        arguments: args.join(' ')
      },
      vscode.TaskScope.Workspace,
      `assemble ${path.basename(filePath)}`,
      'lwasm',
      new vscode.ProcessExecution(this.getPathForPlatform(this.lwasmConfig), [
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
      {
        type: 'asm6x09',
        command: 'xroar',
        file: filePath,
        arguments: args.join(' ')
      },
      vscode.TaskScope.Workspace,
      'run',
      'xroar',
      new vscode.ProcessExecution(this.getPathForPlatform(this.xroarConfig), [
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