import * as fs from 'fs';
import * as vscode from 'vscode';
import * as parser from './parser';

export class CompletionItemProvider implements vscode.CompletionItemProvider {

  private watcher: vscode.FileSystemWatcher;

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.CompletionItem[]> {
    return new Promise(resolve => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);
        const assemblyDocument = new parser.AssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];

        if (assemblyLine.operand && range.intersection(assemblyLine.operandRange)) {
          resolve(assemblyDocument.findLabel(word).map(x => new vscode.CompletionItem(x, vscode.CompletionItemKind.Variable)));
        }
      }
    });
  }
}
