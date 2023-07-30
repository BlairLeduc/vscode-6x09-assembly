import * as vscode from 'vscode';
import * as path from 'path';

import { ConfigurationManager, WorkspaceManager } from './managers';

export class State implements vscode.Disposable {
  private storage: Map<string, vscode.Disposable> = new Map<string, vscode.Disposable>();

  constructor(private configSection: string) {
    this.storage.set('ConfigurationManager', new ConfigurationManager(configSection));
    this.storage.set('WorkspaceManager', new WorkspaceManager(path.join(__dirname, '..')));
  }

  public dispose(): void {
    this.storage.forEach(value => value.dispose());
  }

  public get configurationManager(): ConfigurationManager {
    return this.storage.get('ConfigurationManager') as ConfigurationManager;
  }

  public get workspaceManager(): WorkspaceManager {
    return this.storage.get('WorkspaceManager') as WorkspaceManager;
  }
}
