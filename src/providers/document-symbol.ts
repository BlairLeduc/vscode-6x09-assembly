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

            // All symbols are converted to DocumentSymbols
            const documentSymbol = new vscode.DocumentSymbol(
              symbol.text,
              symbol.documentation,
              convertToSymbolKind(symbol.kind.toString()),
              symbol.lineRange,
              symbol.range
            );

            // Class symbols are struct's and have properties
            if (symbol.properties.length > 0) {
              documentSymbol.children = symbol.properties
                .sort((a, b) => a.text.localeCompare(b.text))
                .map(property => {
                  return new vscode.DocumentSymbol(
                    property.text,
                    property.documentation,
                    convertToSymbolKind(property.kind.toString()),
                    property.lineRange,
                    property.range
                  );
                });
            }

            return documentSymbol;
          });
      }
    }
  }
}