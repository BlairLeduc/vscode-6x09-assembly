import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class DocumentLinkProvider implements vscode.DocumentLinkProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideDocumentLinks(
    document: vscode.TextDocument,
    canellationToken: vscode.CancellationToken): Promise<vscode.DocumentLink[] | undefined> {

    if (!canellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, canellationToken);

      if (assemblyDocument) {
        return assemblyDocument.referencedDocuments
          .map(d => new vscode.DocumentLink(d.range, d.uri));
      }
    }
  }
}
