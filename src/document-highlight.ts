import * as fs from 'fs';
import * as vscode from 'vscode';
import * as parser from './parser';

export class DocumentHighlightProvider implements vscode.DocumentHighlightProvider {
  public provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.DocumentHighlight[]> {
    return new Promise(resolve => {
      const range = document.getWordRangeAtPosition(position);
      if (range) {
        const word = document.getText(range);
        const assemblyDocument = new parser.AssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];

        if ((assemblyLine.label && range.intersection(assemblyLine.labelRange)) || (assemblyLine.operand && range.intersection(assemblyLine.operandRange))) {
          resolve(assemblyDocument.findReferences(word, true).map(s => new vscode.Location(document.uri, s.range)));
        }
      }
    });
  }

}
