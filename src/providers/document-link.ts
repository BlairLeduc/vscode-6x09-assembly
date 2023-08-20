import * as vscode from 'vscode';

import { WorkspaceManager } from '../managers';

export class DocumentLinkProvider implements vscode.DocumentLinkProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideDocumentLinks(
    document: vscode.TextDocument,
    canellationToken: vscode.CancellationToken): Promise<vscode.DocumentLink[] | undefined> {

    if (!canellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);

      if (assemblyDocument) {
        return assemblyDocument.referencedDocuments
          .map(d => new vscode.DocumentLink(d.range, d.uri));
      }
    }
  }
}
