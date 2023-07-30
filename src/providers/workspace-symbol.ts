import * as vscode from 'vscode';

import { convertToSymbolKind } from '../common';
import { WorkspaceManager } from '../managers';

export class WorkspaceSymbolProvider implements vscode.WorkspaceSymbolProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideWorkspaceSymbols(
    query: string,
    cancellationToken: vscode.CancellationToken): Promise<vscode.SymbolInformation[] | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const symbolManagers = this.workspaceManager.getAllSymbolManagers();

      if (!cancellationToken.isCancellationRequested) {
        return symbolManagers
          .map(sm => sm.implementations)
          .reduce((v, s) => v.concat(s))
          .filter(s => !s.isLocal && s.text.startsWith(query))
          .sort((a, b) => a.text.localeCompare(b.text))
          .map(symbol => {
            const documentSymbol = new vscode.SymbolInformation(
              symbol.text,
              convertToSymbolKind(symbol.kind.toString()),
              symbol.parent ? symbol.parent.text : '',
              new vscode.Location(symbol.uri, symbol.range)
            );
            return documentSymbol;
          });
      }
    }
  }
}
