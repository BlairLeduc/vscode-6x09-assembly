import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class DocumentHighlightProvider implements vscode.DocumentHighlightProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideDocumentHighlights(
    document: vscode.TextDocument,
    position: vscode.Position,
    cancellationToken: vscode.CancellationToken): Promise<vscode.DocumentHighlight[] | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (symbolManager) {
        const symbol = symbolManager.implementations
          .find(r => r.range.contains(position));

        if (symbol) {
          const highlights = symbolManager.references
            .filter(r => r.text === symbol.text)
            .map(s => new vscode.DocumentHighlight(s.range));
            
          return [new vscode.DocumentHighlight(symbol.range), ...highlights];
        } else {
          let reference = symbolManager.references
            .find(r => r.range.contains(position));

          if (reference) {
            const implementation = symbolManager.implementations
              .find(r => r.text === reference!.text);
            
            if (implementation) {
              reference = implementation;
            }

            const highlights = symbolManager.references
              .filter(r => r.text === reference!.text)
              .map(s => new vscode.DocumentHighlight(s.range));

              return [new vscode.DocumentHighlight(reference.range), ...highlights];
          } else {
            return [];
          }
        }
      }
    }
  }
}