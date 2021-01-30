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

        const reference = assemblyLine.references.find(r => r.range.contains(position));

        if (reference) {
          resolve([new vscode.Location(reference.definition.uri, reference.definition.range)]);
        } else {
          resolve([]);
        }
      } else {
        reject();
      }
    });
  }
}
