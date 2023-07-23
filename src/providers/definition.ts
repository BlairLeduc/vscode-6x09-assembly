import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class DefinitionProvider implements vscode.DefinitionProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    cancellationToken: vscode.CancellationToken): vscode.Location[] | undefined {

    if (!cancellationToken.isCancellationRequested) {
      const assemblyDocument = this.workspaceManager
        .getAssemblyDocument(document, cancellationToken);

      const symbolManager = this.workspaceManager.getSymbolManager(document);

      if (assemblyDocument && symbolManager) {
        const assemblyLine = assemblyDocument.lines[position.line];
        const reference = assemblyLine.references.find(r => r.range.contains(position));
        const implementation = symbolManager.implementations.find(i => reference?.text === i.text);
        
        if (reference && implementation && implementation.uri) {
          return [new vscode.Location(implementation.uri, implementation.range)];
        }

        const property = assemblyLine.properties.find(p => p.range.contains(position));
        if (property && property.parent && property.parent.uri) {
          return [new vscode.Location(property.parent.uri, property.parent.range)];
        }

        if (assemblyLine.type
          && assemblyLine.typeRange && assemblyLine.typeRange.contains(position)) {

          const type = symbolManager.implementations.find(t => t.text === assemblyLine.type!.text);
          if (type && type.uri) {
            return [new vscode.Location(type.uri, type.range)];
          }
        }
      }

      return [];
    }
  }
}
