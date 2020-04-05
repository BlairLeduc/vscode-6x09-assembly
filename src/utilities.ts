import { SymbolKind } from 'vscode';
import { OpcodeCase } from './managers/configuration';

export function convertToCase(name: string, casing: OpcodeCase): string {
  if (casing === OpcodeCase.lowercase) {
    return name.toLowerCase();
  }
  if (casing === OpcodeCase.capitalised) {
    return name[0].toUpperCase() + name.substr(1).toLowerCase();
  }
  return name.toUpperCase();
}

export function convertToSymbolKind(kind: string): SymbolKind {
  return SymbolKind[kind];
}
