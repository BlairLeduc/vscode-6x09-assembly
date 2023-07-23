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
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);

      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && symbolManager) {
        const assemblyLine = assemblyDocument.lines[position.line];

        const symbol = symbolManager.implementations
          .find(r => r.range.contains(position)) ?? assemblyLine.label;

        if (assemblyLine.labelRange && symbol && symbol.range.contains(position)) {
          const references = symbolManager.references
            .filter(r => r.text === symbol.text).map(s => new vscode.DocumentHighlight(s.range));
            
          return [new vscode.DocumentHighlight(assemblyLine.labelRange), ...references];
        } else {
          return [];
        }
      }
    }
  }
}