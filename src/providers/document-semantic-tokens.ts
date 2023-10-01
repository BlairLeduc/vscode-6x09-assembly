import * as vscode from 'vscode';

import { TokenKind, TokenModifier, TokenType } from '../constants';
import { WorkspaceManager } from '../managers';

export const documentSemanticTokensLegend = new vscode.SemanticTokensLegend(
  Object.values(TokenType) as string[],
  Object.values(TokenModifier) as string[]);

// The semantic tokens provider supplies the information required for semantic highlighting in
// the editor.
export class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public async provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    cancellationToken: vscode.CancellationToken): Promise<vscode.SemanticTokens | undefined> {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && symbolManager) {
        const tokensBuilder = new vscode.SemanticTokensBuilder(documentSemanticTokensLegend);

        assemblyDocument.lines.forEach(line => {
          line.semanicTokens?.forEach(token => {
            if (token.type !== TokenType.namespace) { // ignore namespace tokens
              let type: number = token.type;
              let modifiers: number = token.modifiers;

              if (token.kind === TokenKind.reference) {
                const symbol = symbolManager.implementations.find(i => i.text === token.text);
                if (symbol) {
                  type = symbol.semanticToken.type;
                  modifiers = symbol.semanticToken.modifiers;
                }
              }

              tokensBuilder.push(
                line.lineNumber,
                token.char,
                token.length,
                type,
                modifiers
              );
            }
          });
        });

        return tokensBuilder.build();
      }
    }
  }
}
