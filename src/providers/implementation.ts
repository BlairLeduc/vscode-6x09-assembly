import * as vscode from 'vscode';

import { WorkspaceManager } from '../managers';

// The implementation provider supplies the inormation required for go to implementation feature.
export class ImplementationProvider implements vscode.ImplementationProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideImplementation(
    document: vscode.TextDocument,
    position: vscode.Position,
    cancellationToken: vscode.CancellationToken)
    : Promise<vscode.Location | vscode.Location[] | vscode.LocationLink[] | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (symbolManager) {
        const reference = symbolManager.references
          .find(r => r.range.contains(position));

        if (reference) {
          const implementation = symbolManager.implementations
            .find(i => i.text === reference.text && i.blockNumber === reference.blockNumber);

          return implementation
            ? new vscode.Location(implementation.uri, implementation.range)
            : undefined;
        }
      }
    }
  }
}
