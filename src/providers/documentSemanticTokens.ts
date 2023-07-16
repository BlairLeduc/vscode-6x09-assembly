import * as vscode from 'vscode';
import { TokenModifier, TokenType } from '../common';
import { WorkspaceManager } from '../managers/workspace';

export const documentSemanticTokensLegend = new vscode.SemanticTokensLegend(Object.values(TokenType) as string[], Object.values(TokenModifier) as string[]);

export class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SemanticTokens> {
    return new Promise(resolve => {
      if (!token.isCancellationRequested) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
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

          resolve(tokensBuilder.build());
        }
      } else {
        resolve(null);
      }
    });
  }
}
