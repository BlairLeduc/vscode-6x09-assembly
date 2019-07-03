import * as vscode from 'vscode';
import * as parser from './parser';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class DocumentHighlightProvider implements vscode.DocumentHighlightProvider {

  constructor(private workspaceManager: AssemblyWorkspaceManager) {
  }

  public provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.DocumentHighlight[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];

        if ((assemblyLine.label && range.intersection(assemblyLine.labelRange)) || (assemblyLine.operand && range.intersection(assemblyLine.operandRange))) {
          resolve(assemblyDocument.findReferences(word, true).map(s => new vscode.Location(document.uri, s.range)));
          return;
        }
      }

      reject();
    });
  }
}
