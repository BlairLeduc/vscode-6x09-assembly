import * as vscode from 'vscode';
import * as parser from './parser';
import { AssemblyWorkspaceManager } from './workspace-manager';

export class ReferenceProvider implements vscode.ReferenceProvider {

  constructor(private workspaceManager: AssemblyWorkspaceManager) {
  }

  public provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): Promise<vscode.Location[]> {
    return new Promise((resolve, reject) => {
      const range = document.getWordRangeAtPosition(position);

      if (range) {
        const word = document.getText(range);
        const assemblyDocument = this.workspaceManager.getAssemblyDocument(document);
        const assemblyLine = assemblyDocument.lines[position.line];

        if (assemblyLine.label && range.intersection(assemblyLine.labelRange)) {
          resolve(assemblyDocument.findReferences(word, context.includeDeclaration).map(s => new vscode.Location(document.uri, s.range)));
          return;
        }
      }

      reject();
    });
  }

}
