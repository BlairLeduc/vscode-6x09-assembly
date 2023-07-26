import * as vscode from 'vscode';

import { WorkspaceManager } from '../managers';

export class RenameProvider implements vscode.RenameProvider {

  constructor(private workspaceManager: WorkspaceManager) { }

  public async provideRenameEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string,
    cancellationToken: vscode.CancellationToken): Promise<vscode.WorkspaceEdit | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (symbolManager) {
        const edit = new vscode.WorkspaceEdit();

        // First, check if the user is renaming a label
        const implementation = symbolManager.implementations
          .find(i => i.range.contains(position));

        if (implementation) {
          edit.replace(implementation.uri, implementation.range, newName);

          symbolManager.references
            .filter(r => r.text === implementation.text
              && r.blockNumber === implementation.blockNumber)
            .forEach(s => edit.replace(s.uri, s.range, newName));
        } else {
          // Next, check if the user is renaming a reference
          const reference = symbolManager.references
            .find(r => r.range.contains(position));

          if (reference) {
            const implementation = symbolManager.implementations
              .find(i => i.text === reference.text
                && i.blockNumber === reference.blockNumber);

            if (implementation) {
              edit.replace(implementation.uri, implementation.range, newName);
            }

            symbolManager.references
              .filter(r => r.text === reference.text
                && r.blockNumber === reference.blockNumber)
              .forEach(s => edit.replace(s.uri, s.range, newName));
          }
        }

        return edit;
      }
    }
  }

  public async prepareRename?(
    document: vscode.TextDocument,
    position: vscode.Position,
    cancellationToken: vscode.CancellationToken)
    : Promise<vscode.Range | { range: vscode.Range; placeholder: string; } | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (symbolManager) {
        const implementation = symbolManager.implementations
          .find(r => r.range.contains(position));

        if (implementation) {
          return { range: implementation.range, placeholder: implementation.text };
        }

        const reference = symbolManager.references
          .find(r => r.range.contains(position));
        
        if (reference) {
          return { range: reference.range, placeholder: reference.text };
        }
      }
    }
  }
}
