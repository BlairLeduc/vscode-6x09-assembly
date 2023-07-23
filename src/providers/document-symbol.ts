import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { convertToSymbolKind } from '../utilities';

export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideDocumentSymbols(
    document: vscode.TextDocument,
    cancellationToken: vscode.CancellationToken)
      : Promise<vscode.SymbolInformation[] | vscode.DocumentSymbol[] | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);

      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && symbolManager) {
        return symbolManager.implementations
          .filter(s => s.uri.fsPath === document.uri.fsPath && !s.isLocal)
          .sort((a, b) => a.text.localeCompare(b.text))
          .map(symbol => {
            const documentSymbol = new vscode.DocumentSymbol(
              symbol.text,
              symbol.documentation,
              convertToSymbolKind(symbol.kind.toString()),
              symbol.lineRange,
              symbol.range
            );

            if (symbol.kind === vscode.CompletionItemKind.Class && symbol.blockNumber > 0) {
              const block = assemblyDocument.blocks.get(symbol.blockNumber);
              if (block) {
                documentSymbol.children = block.symbols
                  .sort((a, b) => a.text.localeCompare(b.text))
                  .filter(s => s.kind !== vscode.CompletionItemKind.Class)
                  .map(blockSymbol => {
                    return new vscode.DocumentSymbol(
                      blockSymbol.text,
                      blockSymbol.documentation,
                      convertToSymbolKind(blockSymbol.kind.toString()),
                      symbol.lineRange,
                      symbol.range
                    );
                  });
              }
            }

            return documentSymbol;
          });
      }
    }
  }
}