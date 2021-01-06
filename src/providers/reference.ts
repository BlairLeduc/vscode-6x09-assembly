import * as vscode from 'vscode';
import { referencableKinds } from '../common';
import { WorkspaceManager } from '../managers/workspace';


export class ReferenceProvider implements vscode.ReferenceProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);

      if (!token.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];

        let symbol = assemblyLine.tokens.find(t => t.range.contains(position));

        if (symbol.kind === vscode.CompletionItemKind.Reference && symbol.parent) {
          symbol = symbol.parent;
        }

        if (referencableKinds.indexOf(symbol.kind) >= 0) {
          const references = symbol.children.map(s => new vscode.Location(s.uri, s.range));
          if (context.includeDeclaration) {
            resolve([new vscode.Location(symbol.uri, symbol.range), ...references]);
          } else {
            resolve(references);
          }
        }
      } else {
        reject();
      }
    });
  }
}
