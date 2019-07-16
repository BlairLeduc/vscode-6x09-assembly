import * as vscode from 'vscode';
import { AssemblyConfigurationManager } from './config';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class CodeLensProvider implements vscode.CodeLensProvider {
  private enabled: boolean = true;
  private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();

  constructor(private workspaceManager: AssemblyWorkspaceManager, private configurationManger: AssemblyConfigurationManager) {
    this.enabled = configurationManger.isCodeLensEnabled;

    configurationManger.onDidChangeConfiguration(() => {
      const enabled = this.configurationManger.isCodeLensEnabled;
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
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);

        const lenses = new Array<vscode.CodeLens>();
        assemblyDocument.symbols.forEach(symbol => {
          const references = assemblyDocument.findReferences(symbol.name, false);
          const command: vscode.Command = {
            command: 'editor.action.showReferences',
            title: `${references.length} reference${references.length !== 1 ? 's' : ''}`,
            arguments: [document.uri, symbol.range.start, references.map(r => new vscode.Location(document.uri, r.range)) ],
          };
          lenses.push({
            command,
            range: symbol.range,
            isResolved: true,
          });
        });

        resolve(lenses);
      } else {
        reject();
      }
    });
  }
}
