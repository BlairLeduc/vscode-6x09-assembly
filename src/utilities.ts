import { SymbolKind } from 'vscode';
import { opcodeCase } from './config';

export function convertToCase(name: string, casing: opcodeCase): string {
  if (casing === opcodeCase.lowercase) {
    return name.toLowerCase();
  }
  if (casing === opcodeCase.capitalised) {
    return name[0].toUpperCase() + name.substr(1).toLowerCase();
  }
  return name.toUpperCase();
}

export function convertToSymbolKind(kind: string): SymbolKind {
  return SymbolKind[kind];
}
