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

        if (!token.isCancellationRequested) {
          const word = document.getText(range);
          const assemblyLine = assemblyDocument.lines[position.line];

          if ((assemblyLine.operand && range.intersection(assemblyLine.operandRange))
            || (assemblyLine.label && range.intersection(assemblyLine.labelRange))) {
            resolve(assemblyDocument.findLabel(word).map(s => new vscode.Location(document.uri, s.range)));
            return;
          }

          if (assemblyLine.opcode && range.intersection(assemblyLine.opcodeRange)) {
            resolve(assemblyDocument.findMacro(word).map(s => new vscode.Location(document.uri, s.range)));
            return;
          }
        }

        reject();
      }
    });
  }
}
