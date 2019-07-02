import * as vscode from 'vscode';
import * as parser from './parser';

export class DefinitionProvider implements vscode.DefinitionProvider {

  public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);
        const assemblyDocument = parser.AssemblyDocuments[document.uri.toString()] || new parser.AssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];

        if ((assemblyLine.operand && range.intersection(assemblyLine.operandRange)) || (assemblyLine.label && range.intersection(assemblyLine.labelRange))) {
          resolve(assemblyDocument.findLabel(word).map(s => new vscode.Location(document.uri, s.range)));
          return;
        }
      }

      reject();
    });
  }
}
