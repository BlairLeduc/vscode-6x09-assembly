import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';


export class SelectionRangeProvider implements vscode.SelectionRangeProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideSelectionRanges(document: vscode.TextDocument, positions: vscode.Position[], token: vscode.CancellationToken): vscode.ProviderResult<vscode.SelectionRange[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
      const selectionRanges: vscode.SelectionRange[] = [];

      positions.forEach(position => {
        if (assemblyDocument && !token.isCancellationRequested) {
          const assemblyLine = assemblyDocument.lines[position.line];
          const lineSelectionRange = new vscode.SelectionRange(assemblyLine.lineRange);
          const operandSelectionRange = assemblyLine.operandRange
            ? new vscode.SelectionRange(assemblyLine.operandRange, lineSelectionRange)
            : undefined;

          const symbol = assemblyLine.references.find(r => r.range.contains(position)) ?? assemblyLine.label;
          if (symbol) {
            if (operandSelectionRange && assemblyLine.operandRange?.contains(position)) {
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
