import * as vscode from "vscode";

import { Token, TokenType } from "../constants";
import { convertTokenKindToComplitionItemKind } from "../common/convert";

export class AssemblySymbol {
  public semanticToken: Token;
  public text: string;
  public range: vscode.Range; // The range of the symbol in the document
  public type: TokenType;
  public kind: vscode.CompletionItemKind;
  public value: string = "";
  public blockNumber: number;
  public parent?: AssemblySymbol;
  public properties: AssemblySymbol[];
  public documentation: string;
  public isValid: boolean;
  public isLocal: boolean;

  constructor(
    token: Token,
    public uri: vscode.Uri,
    public lineNumber: number,
    blockNumber: number) {

    this.semanticToken = token;
    this.text = token.text;
    this.range = new vscode.Range(
      lineNumber,
      token.char,
      lineNumber,
      token.char + token.length);
    this.kind = convertTokenKindToComplitionItemKind(token.kind);
    this.type = token.type;
    this.isLocal = token.isLocal;
    this.blockNumber = token.isLocal ? blockNumber : 0;
    this.properties = [];
    this.documentation = '';
    this.isValid = token.isValid;
    this.isLocal = token.isLocal;
  }
}
