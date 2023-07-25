import * as vscode from 'vscode';

export class AssemblyFileReference {
  constructor(
    public uri: vscode.Uri,
    public range: vscode.Range,
  ) {
  }
}

