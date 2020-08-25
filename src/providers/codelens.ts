import * as vscode from 'vscode';
import { ConfigurationManager } from '../managers/configuration';
import { WorkspaceManager } from '../managers/workspace';

export class CodeLensProvider implements vscode.CodeLensProvider {
  private enabled = true;
  private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();

  constructor(private workspaceManager: WorkspaceManager, private configurationManager: ConfigurationManager) {
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

  public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
    return new Promise((resolve, reject) => {
      if (this.enabled) {
        const symbolManager = this.workspaceManager.getSymbolManager(document);

        if (!token.isCancellationRequested) {
          const lenses = new Array<vscode.CodeLens>();
          symbolManager.findDefinitionsInDocument(document.uri).forEach(symbol => {
            const references = symbolManager.findReferencesByName(symbol.name, false);
            const command: vscode.Command = {
              command: 'editor.action.showReferences',
              title: `${references.length} reference${references.length !== 1 ? 's' : ''}`,
              arguments: [document.uri, symbol.range.start, references.map(r => new vscode.Location(r.uri, r.range))],
            };
            lenses.push({
              command,
              range: symbol.range,
              isResolved: true,
            });
          });

          resolve(lenses);
        }
      } else {
        reject();
      }
    });
  }
}
