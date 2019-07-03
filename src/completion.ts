import * as vscode from 'vscode';
import { AssemblySymbol } from './parser';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class CompletionItemProvider implements vscode.CompletionItemProvider {

  constructor(private workspaceManager: AssemblyWorkspaceManager) {
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.CompletionItem[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);

        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];

        if (assemblyLine.operand && range.intersection(assemblyLine.operandRange)) {
          resolve(assemblyDocument.findLabel(word).map(label => this.createCompletionItem(label)));
          return;
        }
      }

      reject();
    });
  }

  private createCompletionItem(symbol: AssemblySymbol): vscode.CompletionItem {
    const item = new vscode.CompletionItem(symbol.name, vscode.CompletionItemKind.Variable);
    if (symbol.documentation) {
      item.detail = symbol.documentation;
    }

    return item;
  }
}
