import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class RenameProvider implements vscode.RenameProvider {

  constructor(private workspaceManager: WorkspaceManager) { }

  public provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

      if (assemblyDocument && !token.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const symbol = assemblyLine.references.find(r => r.range.contains(position))?.definition ?? assemblyLine.label;
        if (symbol && symbol.uri && symbol.range.contains(position)) {
          const edit = new vscode.WorkspaceEdit();
          edit.replace(symbol.uri, symbol.range, newName);
          symbol.references.forEach(s => edit.replace(document.uri, s.range, newName));
          resolve(edit);
        }
      } else {
        reject();
      }
    });
  }

  public prepareRename?(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string; }> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

      if (assemblyDocument && !token.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const symbol = assemblyLine.references.find(r => r.range.contains(position))?.definition ?? assemblyLine.label;
        if (symbol && symbol.range.contains(position)) {
          resolve({range: symbol.range, placeholder: symbol.text});
        }
      } else {
        reject();
      }
    });
  }
}
