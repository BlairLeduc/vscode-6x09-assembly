import * as vscode from 'vscode';

import {
  completionItemKindTranslation,
  OpcodeCase,
  symbolKindTranslation,
  Token,
  TokenKind,
  TokenModifier,
  TokenType,
  tokenTypeToString,
  tokenTypeTranslation
} from '../constants';

export function convertToCase(name: string, casing: OpcodeCase): string {
  if (casing === OpcodeCase.lowercase) {
    return name.toLowerCase();
  }
  if (casing === OpcodeCase.capitalised) {
    return name[0].toUpperCase() + name.substring(1).toLowerCase();
  }
  return name.toUpperCase();
}

export function convertTokenKindToComplitionItemKind(kind: TokenKind): vscode.CompletionItemKind {
  return completionItemKindTranslation[kind];
}

export function convertTokenToName(token: Token): string {
  let name = tokenTypeToString[token.type];
  if (token.modifiers & TokenModifier.readonly) {
    name = 'constant';
  }
  if (token.type === TokenType.variable && token.modifiers === TokenModifier.static) {
    name = 'register';
  }
  return name;
}

export function convertTokenKindToSymbolKind(kind: TokenKind): vscode.SymbolKind {
  return symbolKindTranslation[kind];
}

export function convertTokenKindToTokenType(kind: TokenKind): string {
  return tokenTypeTranslation[kind];
}

export function convertToSymbolKind(kind: string): vscode.SymbolKind {
  return vscode.SymbolKind[kind as keyof typeof vscode.SymbolKind];
}

