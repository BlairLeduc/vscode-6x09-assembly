import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class DefinitionProvider implements vscode.DefinitionProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, token);
        const symbolManager = this.workspaceManager.getSymbolManager(document);

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const assemblyLine = assemblyDocument.lines[position.line];

          if ((assemblyLine.operandRange && range.intersection(assemblyLine.operandRange))
            || (assemblyLine.labelRange && range.intersection(assemblyLine.labelRange))) {
            resolve(symbolManager.findDefinitionsByName(word).map(s => new vscode.Location(s.uri, s.range)));
            return;
          }

          if (assemblyLine.opcodeRange && range.intersection(assemblyLine.opcodeRange)) {
            resolve(symbolManager.findMacro(word).map(s => new vscode.Location(s.uri, s.range)));
            return;
          }
        }

        reject();
      }
    });
  }
}
