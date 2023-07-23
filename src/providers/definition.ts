import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class DefinitionProvider implements vscode.DefinitionProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    cancellationToken: vscode.CancellationToken): vscode.Location[] | undefined {

    if (!cancellationToken.isCancellationRequested) {
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (symbolManager) {
        const reference = symbolManager.references
          .find(r => r.range.contains(position));

        if (reference) {
          const implementation = symbolManager.implementations
            .find(i => i.text === reference.text && i.blockNumber === reference.blockNumber);

          return implementation
            ? [new vscode.Location(implementation.uri, implementation.range)]
            : undefined;
        }
        
        // Provide location of definition for labels
        const implementation = symbolManager.implementations
          .find(i => i.range.contains(position));

        return implementation
          ? [new vscode.Location(implementation.uri, implementation.range)]
          : undefined;
      }
    }
  }
}
