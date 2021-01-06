import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';


export class SelectionRangeProvider implements vscode.SelectionRangeProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideSelectionRanges(document: vscode.TextDocument, positions: vscode.Position[], token: vscode.CancellationToken): vscode.ProviderResult<vscode.SelectionRange[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
      const selectionRanges = [];

      positions.forEach(position => {
        if (!token.isCancellationRequested) {
          const assemblyLine = assemblyDocument.lines[position.line];
          const lineSelectionRange = new vscode.SelectionRange(assemblyLine.lineRange);
          const operandSelectionRange = new vscode.SelectionRange(assemblyLine.operandRange, lineSelectionRange);

          const symbol = assemblyLine.tokens.find(t => t.range.contains(position));
          if (symbol) {
            if (assemblyLine.operandRange.contains(position)) {
              selectionRanges.push(new vscode.SelectionRange(symbol.range, operandSelectionRange));
            } else {
              selectionRanges.push(new vscode.SelectionRange(symbol.range, lineSelectionRange));
            }
          } else {
            selectionRanges.push(lineSelectionRange);
          }
        } else {
          reject();
        }
        resolve(selectionRanges);
      });
    });
  }
}
