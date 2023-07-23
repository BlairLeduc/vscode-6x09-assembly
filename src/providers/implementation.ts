import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class ImplementationProvider implements vscode.ImplementationProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideImplementation(
    document: vscode.TextDocument,
    position: vscode.Position,
    cancellationToken: vscode.CancellationToken)
      : Promise<vscode.Location | vscode.Location[] | vscode.LocationLink[] | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);

      if (assemblyDocument && !cancellationToken.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];

        const symbol = assemblyLine.references
          .find(r => r.range.contains(position)) ?? assemblyLine.label;

        return symbol && symbol.uri && symbol.range.contains(position)
          ? [new vscode.Location(symbol.uri, symbol.range)]
          : [];
      }
    }
  }
}
