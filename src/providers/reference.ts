import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';


export class ReferenceProvider implements vscode.ReferenceProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.ReferenceContext,
    cancellationToken: vscode.CancellationToken): Promise<vscode.Location[] | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (symbolManager) {
        const implementation = symbolManager.implementations
          .find(r => r.range.contains(position));

        if (implementation) {
          const references = symbolManager.references
            .filter(r => r.text === implementation.text
              && r.blockNumber === implementation.blockNumber)
            .map(r => new vscode.Location(r.uri, r.range));

          return context.includeDeclaration
            ? [new vscode.Location(implementation.uri, implementation.range), ...references]
            : references;
        }
      }
    }
  }
}
