import * as vscode from 'vscode';
import { Logger } from '../logger';

export interface CommandConfiguration {
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
  lowercase = 'lowercase',
  uppercase = 'uppercase',
  capitalised = 'capitalised',
}

export enum HelpVerbosity {
  none = 'none',
  light = 'light',
  full = 'full',
}

export class ConfigurationManager implements vscode.Disposable {
  private onDidChangeConfigurationEmitter = new vscode.EventEmitter<void>();
  private config?: ExtensionWorkspaceConfiguration;
  private defaultConfiguration = {
    opcode: {
      casing: OpcodeCase.lowercase,
      help: HelpVerbosity.full,
    },
    enableCodeLens: true,
    lwasm: {
      path: {
        linux: '/usr/local/bin/lwasm',
        macOS: '/usr/local/bin/lwasm',
        windows: 'C:\\lwtools\\lwasm.exe',
      },
      arguments: '--6309',
    },
    xroar: {
      path: {
        linux: '/usr/local/bin/xroar',
        macOS: '/usr/local/bin/xroar',
        windows: 'C:\\XRoar\\XRoar.exe',
      },
      arguments: '-machine coco2bus',
    },
    debugPort: 65520,
  };

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

    Logger.info(`Configuration updated for language "${this.language}"`);

    this.onDidChangeConfigurationEmitter.fire();
  }

  public get opcodeCasing(): OpcodeCase {
    return this.config
      ? OpcodeCase[this.config.opcode.casing as keyof typeof OpcodeCase]
      : this.defaultConfiguration.opcode.casing;
  }

  public get isCodeLensEnabled(): boolean {
    return this.config?.enableCodeLens ?? this.defaultConfiguration.enableCodeLens;
  }

  public get helpVerbosity(): HelpVerbosity {
    return this.config
      ? HelpVerbosity[this.config.opcode.help as keyof typeof HelpVerbosity]
      : this.defaultConfiguration.opcode.help;
  }

  public getCommandConfiguration(command: Command): CommandConfiguration | undefined {
    if (this.config && this.config[Command[command]]) {
      return this.config[Command[command]];
    }

    if (command === Command.lwasm) {
      return this.defaultConfiguration.lwasm;
    }
    
    if (command === Command.xroar) {
      return this.defaultConfiguration.xroar;
    }

    return undefined;
  }

  public get debugPort(): number {
    return this.config?.debugPort ?? this.defaultConfiguration.debugPort;
  }
}
