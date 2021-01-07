import * as vscode from 'vscode';

interface CommandConfiguration {
  path: {
    linux: string;
    macOS: string;
    windows: string;
  };
  arguments: string;
}
interface ExtensionWorkspaceConfiguration extends vscode.WorkspaceConfiguration {

  opcode: {
    /** the casing of the opcodes */
    casing: string,

    /** the level of detail when providing help */
    help: string,
  };

  /** whether Codelens is enabled */
  enableCodeLens: boolean;

  /** lwasm configuration */
  lwasm: CommandConfiguration;

  /** xroar configuration */
  xroar: CommandConfiguration;

  /** the GDB debug port */
  debugPort: number;
}

export enum Command {
  lwasm,
  xroar
}

export enum OSPlatform {
  windows,
  macOS,
  linux
}

export enum OpcodeCase {
  lowercase,
  uppercase,
  capitalised,
}

export enum HelpVerbosity {
  none,
  light,
  full,
}

export class ConfigurationManager implements vscode.Disposable {
  private onDidChangeConfigurationEmitter = new vscode.EventEmitter<void>();
  private config: ExtensionWorkspaceConfiguration;

  constructor(private language: string) {
    this.update(vscode.workspace.getConfiguration(language));
  }

  public dispose(): void {
    this.onDidChangeConfigurationEmitter.dispose();
  }

  public get onDidChangeConfiguration(): vscode.Event<void> {
    return this.onDidChangeConfigurationEmitter.event;
  }

  public update(config: vscode.WorkspaceConfiguration): void {
    this.config = config as ExtensionWorkspaceConfiguration;
    this.onDidChangeConfigurationEmitter.fire();
  }

  public get opcodeCasing(): OpcodeCase {
    return OpcodeCase[this.config.opcode.casing];
  }

  public get isCodeLensEnabled(): boolean {
    return this.config.enableCodeLens;
  }

  public get helpVerbosity(): HelpVerbosity {
    return HelpVerbosity[this.config.opcode.help];
  }

  public getPath(command: Command, platform: OSPlatform): string {
    return this.config[Command[command]].path[OSPlatform[platform]];
  }

  public getArgs(command: Command): string {
    return this.config[Command[command]].arguments;
  }

  public get debugPort (): number {
    return this.config.debugPort;
  }

}
