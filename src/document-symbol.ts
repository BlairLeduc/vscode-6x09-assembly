import * as vscode from 'vscode';
import { convertToSymbolKind } from './utilities';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

  constructor(private workspaceManager: AssemblyWorkspaceManager) {
  }

  public provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
    return new Promise((resolve,reject) => {
      const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
      resolve(assemblyDocument.symbols.map(s => new vscode.DocumentSymbol(s.name, s.documentation, convertToSymbolKind(s.kind.toString()), s.lineRange, s.range)));
    });
  }

}
