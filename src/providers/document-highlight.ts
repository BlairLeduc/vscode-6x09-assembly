import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class DocumentHighlightProvider implements vscode.DocumentHighlightProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentHighlight[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const assemblyLine = assemblyDocument.lines[position.line];

          if ((assemblyLine.label && range.intersection(assemblyLine.labelRange)) || (assemblyLine.operand && range.intersection(assemblyLine.operandRange))) {
            resolve(assemblyDocument.findReferences(word, true).map(s => new vscode.Location(document.uri, s.range)));
            return;
          }
        }

        reject();
      }
    });
  }
}
