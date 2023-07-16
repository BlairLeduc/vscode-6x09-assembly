import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';


export class FoldingRangeProvider implements vscode.FoldingRangeProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public onDidChangeFoldingRanges?: vscode.Event<void>;
  public provideFoldingRanges(document: vscode.TextDocument, _context: vscode.FoldingContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FoldingRange[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

      if (assemblyDocument && !token.isCancellationRequested) {
        const foldingRanges = Array.from(assemblyDocument.blocks.values()).map(b => new vscode.FoldingRange(b.startLineNumber, b.endLineNumber, vscode.FoldingRangeKind.Region));
        resolve(foldingRanges);
      } else {
        reject();
      }
    });
  }
}