import * as vscode from 'vscode';

import { ConfigurationManager, WorkspaceManager } from '../managers';

// The code lens provider supplies the information required for showing code lenses in the editor.
export class CodeLensProvider implements vscode.CodeLensProvider {
  private enabled = true;
  private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();

  constructor(
    private workspaceManager: WorkspaceManager,
    private configurationManager: ConfigurationManager) {

    this.enabled = configurationManager.isCodeLensEnabled;

    configurationManager.onDidChangeConfiguration(() => {
      const enabled = this.configurationManager.isCodeLensEnabled;
      if (this.enabled !== enabled) {
        this.enabled = enabled;
        this.onDidChangeCodeLensesEmitter.fire();
      }
    });
  }

  public get onDidChangeCodeLenses(): vscode.Event<void> {
    return this.onDidChangeCodeLensesEmitter.event;
  }

  public provideCodeLenses(
    document: vscode.TextDocument,
    cancellationToken: vscode.CancellationToken): vscode.CodeLens[] | undefined {

    if (this.enabled && !cancellationToken.isCancellationRequested) {
      const symbolManager = this.workspaceManager.getSymbolManager(document);
      
      if (symbolManager) {
        const lenses: vscode.CodeLens[] = [];

        symbolManager.implementations
          .filter(s => s.uri.toString() === document.uri.toString())
          .forEach(symbol => {

            const references = symbolManager.references
              .filter(r => r.text === symbol.text && r.blockNumber === symbol.blockNumber);
            
            const command: vscode.Command = {
              command: 'editor.action.showReferences',
              title: `${references.length} reference${references.length !== 1 ? 's' : ''}`,
              arguments: [
                document.uri,
                symbol.range.start,
                references.map(r => new vscode.Location(r.uri, r.range))
              ],
            };

            lenses.push({
              command,
              range: symbol.range,
            isResolved: true,
          });
        });

        return lenses;
      }
    }
  }
}