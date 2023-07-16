import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class ImplementationProvider implements vscode.ImplementationProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideImplementation(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

      if (assemblyDocument && !token.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];

        const symbol = assemblyLine.references.find(r => r.range.contains(position))?.definition ?? assemblyLine.label;
        if (symbol && symbol.uri && symbol.range.contains(position)) {
          resolve([new vscode.Location(symbol.uri, symbol.range)]);
        } else {
          resolve([]);
        }
      } else {
        reject();
      }
    });
  }
}
