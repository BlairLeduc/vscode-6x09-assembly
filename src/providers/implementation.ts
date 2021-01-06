import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class ImplementationProvider implements vscode.ImplementationProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideImplementation(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

      if (!token.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];

        let symbol = assemblyLine.tokens.find(t => t.range.contains(position));

        if (symbol.kind === vscode.CompletionItemKind.Reference && symbol.parent) {
          symbol = symbol.parent;
        }

        resolve([new vscode.Location(symbol.uri, symbol.range)]);
      } else {
        reject();
      }
    });
  }
}
