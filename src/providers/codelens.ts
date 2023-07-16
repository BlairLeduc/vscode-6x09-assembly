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
        if (!token.isCancellationRequested) {
          const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
          if (assemblyDocument) {
            const lenses = new Array<vscode.CodeLens>();

            assemblyDocument.symbols.filter(s => s.uri === document.uri).forEach(symbol => {
              const references = symbol.references.filter(r => r.blockNumber === symbol.blockNumber);
              const command: vscode.Command = {
                command: 'editor.action.showReferences',
                title: `${references.length} reference${references.length !== 1 ? 's' : ''}`,
                arguments: [document.uri, symbol.range.start, references
                  .filter(r => r.uri)
                  .map(r => new vscode.Location(r.uri!, r.range))],
              };
              lenses.push({
                command,
                range: symbol.range,
                isResolved: true,
              });

              // Possible bug in VSCode, this breaks code lens
              // references.filter(s => s.uri === document.uri).forEach(reference => {
              //   if (reference.range.start.character === 0) {
              //     const siblings = reference.parent.children;
              //     siblings.splice(siblings.indexOf(reference), 1, symbol);

              //     const command: vscode.Command = {
              //       command: 'editor.action.showReferences',
              //       title: `${siblings.length} reference${siblings.length !== 1 ? 's' : ''}`,
              //       arguments: [document.uri, reference.range.start, siblings.map(r => new vscode.Location(r.uri, r.range))],
              //     };
              //     lenses.push({
              //       command,
              //       range: reference.range,
              //       isResolved: true,
              //     }); 
              //   }
              // });
            });

            resolve(lenses);
          }
        }
      } else {
        reject();
      }
    });
  }
}
