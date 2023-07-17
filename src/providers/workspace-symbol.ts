import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { convertToSymbolKind } from '../utilities';

export class WorkspaceSymbolProvider implements vscode.WorkspaceSymbolProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideWorkspaceSymbols(query: string, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[]> {
    return new Promise((resolve, reject) => {
      const symbolManagers = this.workspaceManager.getAllSymbolManagers();

      if (!token.isCancellationRequested) {
        resolve(symbolManagers.map(sm => sm.symbols).reduce((v, s) => v.concat(s))
          .filter(s => s.uri && !s.isLocal && s.text.startsWith(query))
          .sort((a, b) => a.text.localeCompare(b.text))
          .map(symbol => {
            const documentSymbol = new vscode.SymbolInformation(
              symbol.text,
              convertToSymbolKind(symbol.kind.toString()),
              '',
              new vscode.Location(symbol.uri!, symbol.range)
            );
            return documentSymbol;
          }));
      } else {
        reject();
      }
    });
  }
}
