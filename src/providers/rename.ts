import * as vscode from 'vscode';
import { referencableKinds } from '../common';
import { WorkspaceManager } from '../managers/workspace';

export class RenameProvider implements vscode.RenameProvider {

  constructor(private workspaceManager: WorkspaceManager) { }

  public provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, cancelationToken: vscode.CancellationToken): vscode.ProviderResult<vscode.WorkspaceEdit> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, cancelationToken);
      const assemblyLine = assemblyDocument.lines[position.line];

      if (!cancelationToken.isCancellationRequested) {
        let token = assemblyLine.tokens.find(t => t.range.contains(position));

        if (token.kind === vscode.CompletionItemKind.Reference && token.parent) {
          token = token.parent;
        }
        if (referencableKinds.indexOf(token.kind) >= 0) {
          const edit = new vscode.WorkspaceEdit();
          edit.replace(token.uri, token.range, newName);
          token.children.forEach(s => edit.replace(document.uri, s.range, newName));
          resolve(edit);
        }
      } else {
        reject();
      }
    });
  }

  public prepareRename?(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string; }> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const symbolManager = this.workspaceManager.getSymbolManager(document);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);

          const symbol = symbolManager.findReferencesByName(word, true).find(s => s.range.intersection(range));
          if (symbol) {
            resolve({ range: symbol.range, placeholder: symbol.name });
          }
        }

        reject();
      }
    });
  }
}
