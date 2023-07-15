import * as vscode from 'vscode';

// Provides a configuration for runnung an CLI command on specific platforms
interface CommandConfiguration {
  path: {
    linux: string;
    macOS: string;
    windows: string;
  };
  arguments: string;
}

// Provides a configuration for the extension
interface ExtensionWorkspaceConfiguration extends vscode.WorkspaceConfiguration {

  opcode: {
    // The display casing of the opcodes
    casing: string,

    // The level of detail when providing help 
    help: string,
  };

  // Whether to enable Codelens
  enableCodeLens: boolean;

  // Where to find lwasm
  lwasm: CommandConfiguration;

  // Where to find xroar
  xroar: CommandConfiguration;

  // The GDB debug port
  debugPort: number;
}

// Supported commands
export enum Command {
  lwasm,
  xroar
}

// Supported platforms
export enum OSPlatform {
  windows,
  macOS,
  linux
}

// Available opcode casing
export enum OpcodeCase {
  lowercase,
  uppercase,
  capitalised,
}

// Available help verbosity
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
