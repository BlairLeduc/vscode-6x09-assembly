import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { convertToSymbolKind } from '../utilities';

export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

      if (!token.isCancellationRequested) {
        resolve(assemblyDocument.symbols.filter(s => !s.isLocal && s.uri == document.uri).map(symbol => {
          const documentSymbol = new vscode.DocumentSymbol(
            symbol.text,
            symbol.documentation,
            convertToSymbolKind(symbol.kind.toString()),
            symbol.lineRange,
            symbol.range
          );
          if (symbol.kind === vscode.CompletionItemKind.Class && symbol.blockNumber > 0) {
            const block = assemblyDocument.blocks.get(symbol.blockNumber);
            documentSymbol.children = block.tokens.filter(s => s.kind !== vscode.CompletionItemKind.Class).map(blockSymbol => {
              return new vscode.DocumentSymbol(
                blockSymbol.text,
                blockSymbol.documentation,
                convertToSymbolKind(blockSymbol.kind.toString()),
                symbol.lineRange,
                symbol.range
              );
            });
          }
          return documentSymbol;
        }));
      } else {
        reject();
      }
    });
  }
}
