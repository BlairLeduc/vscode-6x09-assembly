import * as vscode from 'vscode';

import { WorkspaceManager } from '../managers';

// The folding range provider supplies the information required for folding in the editor.
export class FoldingRangeProvider implements vscode.FoldingRangeProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public onDidChangeFoldingRanges?: vscode.Event<void>;

  public async provideFoldingRanges(
    document: vscode.TextDocument,
    _context: vscode.FoldingContext,
    cancellationToken: vscode.CancellationToken): Promise<vscode.FoldingRange[] | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);

      if (assemblyDocument) {
        const foldingRanges = Array
          .from(assemblyDocument.blocks.values())
          .map(b => new vscode.FoldingRange(
            b.startLineNumber,
            b.endLineNumber,
            vscode.FoldingRangeKind.Region));

        return foldingRanges;
      }
    }
  }
}
