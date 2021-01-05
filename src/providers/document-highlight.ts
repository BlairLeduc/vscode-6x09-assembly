import * as vscode from 'vscode';
import { referencableKinds } from '../common';
import { WorkspaceManager } from '../managers/workspace';

export class DocumentHighlightProvider implements vscode.DocumentHighlightProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position, cancelationToken: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentHighlight[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, cancelationToken);

      if (!cancelationToken.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];

        let token = assemblyLine.tokens.find(t => t.range.contains(position));

        if (token.kind === vscode.CompletionItemKind.Reference && token.parent) {
          token = token.parent;
        }

        if (referencableKinds.indexOf(token.kind) >= 0) {
          const references = token.children.map(s => new vscode.DocumentHighlight(s.range));
          resolve([new vscode.DocumentHighlight(token.range), ...references]);
        }
      } else {
        reject();
      }
    });
  }
}
