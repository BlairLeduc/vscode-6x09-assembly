import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { convertToSymbolKind } from '../utilities';

export class WorkspaceSymbolProvider implements vscode.WorkspaceSymbolProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideWorkspaceSymbols(query: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[]> {
    return new Promise((resolve, reject) => {
      const symbolManager = this.workspaceManager.getSymbolManager();

      if (!token.isCancellationRequested) {
        resolve(symbolManager.tokens.filter(s => !s.isLocal && s.text.startsWith(query)).map(symbol => {
          const documentSymbol = new vscode.SymbolInformation(
            symbol.text,
            convertToSymbolKind(symbol.kind.toString()),
            null,
            new vscode.Location(symbol.uri, symbol.range)
          );
          return documentSymbol;
        }));
      } else {
        reject();
      }
    });
  }
}
