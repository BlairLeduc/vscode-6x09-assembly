import { Event, EventEmitter, WorkspaceConfiguration } from 'vscode';

export enum OpcodeCase {
  lowercase,
  uppercase,
  capitalised,
}

export enum HoverVerbosity {
  none,
  light,
  full,
}

export class AssemblyConfigurationManager {
  private onDidChangeConfigurationEmitter = new EventEmitter<void>();
  private config: WorkspaceConfiguration;

  public get onDidChangeConfiguration(): Event<void> {
    return this.onDidChangeConfigurationEmitter.event;
  }

  public update(config: WorkspaceConfiguration) {
    this.config = config;
    this.onDidChangeConfigurationEmitter.fire();
  }

  public get opcodeCasing(): OpcodeCase {
    return OpcodeCase[this.config.get('opcodeCasing', 'lowercase')];
  }

  public get isCodeLensEnabled(): boolean {
    return this.config.get('enableCodeLens', true);
  }

  public get hoverVerbosity(): HoverVerbosity {
    return HoverVerbosity[this.config.get('hovers', 'full')];
  }
}
