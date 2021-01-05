import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class DefinitionProvider implements vscode.DefinitionProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDefinition(document: vscode.TextDocument, position: vscode.Position, cancelationToken: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, cancelationToken);

      if (!cancelationToken.isCancellationRequested) {
        const assemblyLine = assemblyDocument.lines[position.line];

        let token = assemblyLine.tokens.find(t => t.range.contains(position));

        if (token.kind === vscode.CompletionItemKind.Reference && token.parent) {
          token = token.parent;
        }

        resolve([new vscode.Location(token.uri, token.range)]);
      } else {
        reject();
      }
    });
  }
}
