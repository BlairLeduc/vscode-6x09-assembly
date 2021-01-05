import * as vscode from 'vscode';
import { referencableKinds } from '../common';
import { WorkspaceManager } from '../managers/workspace';


export class ReferenceProvider implements vscode.ReferenceProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, cancelationToken: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, cancelationToken);

      if (!cancelationToken.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];

        let token = assemblyLine.tokens.find(t => t.range.contains(position));

        if (token.kind === vscode.CompletionItemKind.Reference && token.parent) {
          token = token.parent;
        }

        if (referencableKinds.indexOf(token.kind) >= 0) {
          const references = token.children.map(s => new vscode.Location(s.uri, s.range));
          if (context.includeDeclaration) {
            resolve([new vscode.Location(token.uri, token.range), ...references]);
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
