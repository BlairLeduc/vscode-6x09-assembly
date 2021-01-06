import * as vscode from 'vscode';
import { referencableKinds } from '../common';
import { WorkspaceManager } from '../managers/workspace';

export class RenameProvider implements vscode.RenameProvider {

  constructor(private workspaceManager: WorkspaceManager) { }

  public provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
      const assemblyLine = assemblyDocument.lines[position.line];

      if (!token.isCancellationRequested) {
        let symbol = assemblyLine.tokens.find(t => t.range.contains(position));

        if (symbol.kind === vscode.CompletionItemKind.Reference && symbol.parent) {
          symbol = symbol.parent;
        }
        if (referencableKinds.indexOf(symbol.kind) >= 0) {
          const edit = new vscode.WorkspaceEdit();
          edit.replace(symbol.uri, symbol.range, newName);
          symbol.children.forEach(s => edit.replace(document.uri, s.range, newName));
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
      const assemblyLine = assemblyDocument.lines[position.line];

      if (!token.isCancellationRequested) {
        const symbol = assemblyLine.tokens.find(t => t.range.contains(position));

        resolve({range: symbol.range, placeholder: symbol.text});
      } else {
        reject();
      }
    });
  }
}
