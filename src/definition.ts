import * as vscode from 'vscode';
import * as parser from './parser';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class DefinitionProvider implements vscode.DefinitionProvider {

  constructor(private workspaceManager: AssemblyWorkspaceManager) {
  }

  public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
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
    });
  }
}
