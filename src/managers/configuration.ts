import * as vscode from 'vscode';

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

export class ConfigurationManager implements vscode.Disposable {
  private onDidChangeConfigurationEmitter = new vscode.EventEmitter<void>();
  private config: vscode.WorkspaceConfiguration;

  public dispose(): void {
    this.onDidChangeConfigurationEmitter.dispose();
  }

  public get onDidChangeConfiguration(): vscode.Event<void> {
    return this.onDidChangeConfigurationEmitter.event;
  }

  public update(config: vscode.WorkspaceConfiguration): void {
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