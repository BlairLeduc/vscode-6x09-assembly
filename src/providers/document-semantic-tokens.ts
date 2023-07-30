import * as vscode from 'vscode';

import { TokenModifier, TokenType } from '../constants';
import { WorkspaceManager } from '../managers';

export const documentSemanticTokensLegend = new vscode.SemanticTokensLegend(
  Object.values(TokenType) as string[],
  Object.values(TokenModifier) as string[]);

export class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    cancellationToken: vscode.CancellationToken): Promise<vscode.SemanticTokens | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);

      if (assemblyDocument) {
        const tokensBuilder = new vscode.SemanticTokensBuilder(documentSemanticTokensLegend);

        assemblyDocument.lines.forEach(line => {
          line.semanicTokens?.forEach(token => {
            if (token.type !== TokenType.namespace) {
              tokensBuilder.push(
                line.lineNumber,
                token.char,
                token.length,
                token.type,
                token.modifiers
              );
            }
          });
        });

        return tokensBuilder.build();
      }
    }
  }
}
