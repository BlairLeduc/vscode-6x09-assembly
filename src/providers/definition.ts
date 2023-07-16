import * as vscode from 'vscode';
import { WorkspaceManager } from '../managers/workspace';

export class DefinitionProvider implements vscode.DefinitionProvider {

  constructor(private workspaceManager: WorkspaceManager) {
  }

  public provideDefinition(document: vscode.TextDocument, position: vscode.Position, cancelationToken: vscode.CancellationToken): vscode.Location[] {
    const assemblyDocument = this.workspaceManager.getAssemblyDocument(document, cancelationToken);

    if (assemblyDocument) {
      const symbolManager = this.workspaceManager.getSymbolManager(document);
      const assemblyLine = assemblyDocument.lines[position.line];
      const reference = assemblyLine.references.find(r => r.range.contains(position));

      if (reference && reference.definition && reference.definition.uri) {
        return [new vscode.Location(reference.definition.uri, reference.definition.range)];
      }

      const property = assemblyLine.properties.find(p => p.range.contains(position));
      if (property && property.definition && property.definition.uri) {
        return [new vscode.Location(property.definition.uri, property.definition.range)];
      }

      if (assemblyLine.type && assemblyLine.typeRange && assemblyLine.typeRange.contains(position)) {
        const type = symbolManager.symbols.find(t => t.text === assemblyLine.type!.text);
        if (type && type.uri) {
          return [new vscode.Location(type.uri, type.range)];
        }
      }
    }
    return [];
  }
}
