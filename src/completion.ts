import * as vscode from 'vscode';
import * as parser from './parser';

export class CompletionItemProvider implements vscode.CompletionItemProvider {

  private watcher: vscode.FileSystemWatcher;

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.CompletionItem[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);

        const assemblyDocument = parser.AssemblyDocuments[document.uri.toString()] || new parser.AssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];

        if (assemblyLine.operand && range.intersection(assemblyLine.operandRange)) {
          resolve(assemblyDocument.findLabel(word).map(label => this.createCompletionItem(label)));
          return;
        }
      }

      reject();
    });
  }

  private createCompletionItem(symbol: parser.AssemblySymbol): vscode.CompletionItem {
    const item = new vscode.CompletionItem(symbol.name, vscode.CompletionItemKind.Variable);
    if (symbol.documentation) {
      item.detail = symbol.documentation;
    }

    return item;
  }
}
