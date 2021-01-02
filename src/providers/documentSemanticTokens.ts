import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

const tokenTypes = ['function', 'struct', 'variable', 'method', 'macro', 'string', 'comment', 'keyword'];
const tokenModifiers = ['declaration', 'readonly'];
export const DocumentSemanticTokensLegend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

export class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }
  
  provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.ProviderResult<vscode.SemanticTokens> {
    // analyze the document and return semantic tokens

    const tokensBuilder = new vscode.SemanticTokensBuilder(DocumentSemanticTokensLegend);
    // on line 1, characters 1-5 are a class declaration
    tokensBuilder.push(
      new vscode.Range(new vscode.Position(1, 1), new vscode.Position(1, 5)),
      'class',
      ['declaration']
    );
    return tokensBuilder.build();
  }
}
