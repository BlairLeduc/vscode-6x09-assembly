import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class RenameProvider implements vscode.RenameProvider {

  constructor(private workspaceManager: WorkspaceManager) { }

  public provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const edit = new vscode.WorkspaceEdit();
          const symbols = assemblyDocument.findReferences(word, true);
          if (symbols) {
            symbols.forEach(s => edit.replace(document.uri, s.range, newName));
          }
          resolve(edit);
        }

        reject();
      }
    });
  }

  public prepareRename?(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string }> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);

          const symbol = assemblyDocument.findReferences(word, true).find(s => s.range.intersection(range));
          if (symbol) {
            resolve({ range: symbol.range, placeholder: symbol.name });
          }
        }

        reject();
      }
    });
  }
}
