import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class DocumentHighlightProvider implements vscode.DocumentHighlightProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position, cancelationToken: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentHighlight[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, cancelationToken);

      if (!cancelationToken.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];

        const symbol = assemblyLine.references.find(r => r.range.contains(position))?.definition ?? assemblyLine.label;
        if (symbol && symbol.range.contains(position)) {
          const references = symbol.references.map(s => new vscode.DocumentHighlight(s.range));
          resolve([new vscode.DocumentHighlight(assemblyLine.labelRange), ...references]);
        } else {
          resolve([]);
        }
      } else {
        reject();
      }
    });
  }
}
