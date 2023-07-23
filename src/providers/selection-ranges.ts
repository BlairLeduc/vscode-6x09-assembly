import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';
import { SymbolManager } from '../managers/symbol';


export class SelectionRangeProvider implements vscode.SelectionRangeProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideSelectionRanges(
    document: vscode.TextDocument,
    positions: vscode.Position[],
    cancellationToken: vscode.CancellationToken): Promise<vscode.SelectionRange[] | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);

      const selectionRanges: vscode.SelectionRange[] = [];

      if (assemblyDocument && SymbolManager) {
        positions.forEach(position => {
          const assemblyLine = assemblyDocument.lines[position.line];
          const lineSelectionRange = new vscode.SelectionRange(assemblyLine.lineRange);
          const operandSelectionRange = assemblyLine.operandRange
            ? new vscode.SelectionRange(assemblyLine.operandRange, lineSelectionRange)
            : undefined;

          const symbol = assemblyLine.references
            .find(r => r.range.contains(position)) ?? assemblyLine.label;

          if (symbol) {
            if (operandSelectionRange && assemblyLine.operandRange?.contains(position)) {
              selectionRanges.push(new vscode.SelectionRange(symbol.range, operandSelectionRange));
            } else {
              selectionRanges.push(new vscode.SelectionRange(symbol.range, lineSelectionRange));
            }
          } else {
            selectionRanges.push(lineSelectionRange);
          }
        });
        return selectionRanges;
      }
    }
  }
}
