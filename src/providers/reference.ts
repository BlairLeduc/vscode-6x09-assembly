import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';


export class ReferenceProvider implements vscode.ReferenceProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

      if (!token.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const symbol = assemblyLine.references.find(r => r.range.contains(position))?.definition ?? assemblyLine.label;
        if (symbol && symbol.range.contains(position)) {
          const references = symbol.references.map(s => new vscode.Location(s.uri, s.range));
          if (context.includeDeclaration) {
            resolve([new vscode.Location(symbol.uri, symbol.range), ...references]);
          } else {
            resolve(references);
          }
        } else {
          resolve([]);
        }
      } else {
        reject();
      }
    });
  }
}
