import * as path from 'path';
import * as vscode from 'vscode';
import { ConfigurationManager } from './managers/configuration';
import { WindowManager } from './managers/window';
import { WorkspaceManager } from './managers/workspace';

export class State implements vscode.Disposable {
  private storage: Map<string, vscode.Disposable> = new Map<string, vscode.Disposable>();

  constructor(private configSection: string) {
    this.storage.set('ConfigurationManager', new ConfigurationManager(configSection));
    this.storage.set('WindowManager', new WindowManager());
    this.storage.set('WorkspaceManager', new WorkspaceManager(path.join(__dirname, '..')));
  }

  public dispose(): void {
    this.storage.forEach(value => value.dispose());
  }

  public get configurationManager(): ConfigurationManager {
    return this.storage.get('ConfigurationManager') as ConfigurationManager;
  }

  public get windowManager(): WindowManager {
    return this.storage.get('WindowManager') as WindowManager;
  }

  public get workspaceManager(): WorkspaceManager {
    return this.storage.get('WorkspaceManager') as WorkspaceManager;
  }
}
