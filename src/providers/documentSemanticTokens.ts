import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

const tokenTypes = [ 'class', 'function', 'struct', 'variable', 'label', 'macro', 'string', 'comment', 'keyword', 'number', 'operator'];
const tokenModifiers = ['definition', 'declaration', 'readonly'];
export const DocumentSemanticTokensLegend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

export class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }
  
  provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SemanticTokens> {
    return new Promise(resolve => {
      if (!token.isCancellationRequested) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
        const tokensBuilder = new vscode.SemanticTokensBuilder(DocumentSemanticTokensLegend);

        assemblyDocument.lines.forEach(asmLine => {
          asmLine.tokens.forEach(token => {
            tokensBuilder.push(
              token.range,
              token.parent ? token.parent.tokenType : token.tokenType,
              token.parent && token.parent.tokenModifiers.indexOf('readonly') >= 0 ? [ 'readonly' ] : token.tokenModifiers
            );
          })
        });

        resolve(tokensBuilder.build());
      }
    });
  }
}
