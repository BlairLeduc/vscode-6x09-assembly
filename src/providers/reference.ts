import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';


export class ReferenceProvider implements vscode.ReferenceProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.ReferenceContext,
    cancellationToken: vscode.CancellationToken): Promise<vscode.Location[] | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);

      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && symbolManager) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const reference = assemblyLine.references
          .find(r => r.range.contains(position)) ?? assemblyLine.label;

        if (reference && reference.uri && reference.range.contains(position)) {
          const references = symbolManager.references
            .filter(r => r.text === reference.text)
            .map(s => new vscode.Location(s.uri, s.range));

          return context.includeDeclaration
            ? [new vscode.Location(reference.uri, reference.range), ...references]
            : references;
        } else {
          return [];
        }
      }
    }
  }
}
