import * as vscode from 'vscode';
import {
  convertToCase, convertTokenKindToComplitionItemKind, convertTokenKindToSymbolKind,
  convertTokenKindToTokenType, convertTokenToName, convertToSymbolKind
} from "../../common";
import { OpcodeCase, Token, TokenKind, TokenModifier, TokenType } from "../../constants";

describe('convert', () => {
  // unit test for convertToCase
  describe('convertToCase', () => {
    it('should convert to lowercase', () => {
      expect(convertToCase('test', OpcodeCase.lowercase)).toBe('test');
    });
    it('should convert to capitalised', () => {
      expect(convertToCase('test', OpcodeCase.capitalised)).toBe('Test');
    });
    it('should convert to uppercase', () => {
      expect(convertToCase('test', OpcodeCase.uppercase)).toBe('TEST');
    });
  });

  // unit test for convertTokenToName
  describe('convertTokenToName', () => {
    it('should convert class to "class"', () => {
      const token = new Token('class', 0, 5, TokenKind.operand, TokenType.string);
      expect(convertTokenToName(token)).toBe('string');
    });
    it('should convert readonly to "readonly"', () => {
      const token = new Token('readonly', 0, 8, TokenKind.operand, TokenType.string);
      token.modifiers = TokenModifier.readonly;
      expect(convertTokenToName(token)).toBe('constant');
    });
    it('should convert modifier variable to register', () => {
      const token = new Token('a', 0, 1, TokenKind.operand, TokenType.variable);
      token.modifiers = TokenModifier.static;
      expect(convertTokenToName(token)).toBe('register');
    });
  });

  // Unit test for convertTokenKindToComplitionItemKind
  describe('convertTokenKindToComplitionItemKind', () => {
    it('should convert TokenKind to CompletionItemKind', () => {
      expect(convertTokenKindToComplitionItemKind(TokenKind.operand))
        .toBe(vscode.CompletionItemKind.Variable);
    });
  });

  // Unit test for convertTokenKindToSymbolKind
  describe('convertTokenKindToSymbolKind', () => {
    it('should convert TokenKind to SymbolKind', () => {
      expect(convertTokenKindToSymbolKind(TokenKind.label))
        .toBe(vscode.SymbolKind.Variable);
    });
  });

  // Unit test for convertTokenKindToTokenType
  describe('convertTokenKindToTokenType', () => {
    it('should convert TokenKind to TokenType', () => {
      expect(convertTokenKindToTokenType(TokenKind.label))
        .toBe("variable");
    });
  });

  // Unit test for convertToSymbolKind
  describe('convertToSymbolKind', () => {
    it('should convert string to SymbolKind', () => {
      expect(convertToSymbolKind("Variable"))
        .toBe(vscode.SymbolKind.Variable);
    });
  });
});
