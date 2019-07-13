import { WorkspaceConfiguration } from 'vscode';

export enum opcodeCase {
  lowercase,
  uppercase,
  capitalised,
}

export class AssemblyConfigurationManager {

  private config: WorkspaceConfiguration;

  public update(config: WorkspaceConfiguration) {
    this.config = config;
  }
  public getOpcodeCasing(): opcodeCase {
    return opcodeCase[this.config.get('opcodeCasing', 'lowercase')];
  }
}
