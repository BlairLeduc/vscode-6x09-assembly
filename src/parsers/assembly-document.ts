import { CancellationToken, CompletionItemKind, Position, Range, TextDocument, Uri } from 'vscode';
import { AssemblyLine, ParserState } from './assembly-line';
import { AssemblySymbol, AssemblyToken, Registers } from '../common';
import * as path from 'path';
import * as lineReader from 'line-reader';
import * as fileUrl from 'file-url';
import * as fs from 'fs';
import { SymbolManager } from '../managers/symbol';
import { Queue } from '../queue';

export class AssemblyDocument {
  private processDocumentsQueue: Queue<string> = new Queue<string>();
  private definitions: AssemblyToken[] = new Array<AssemblyToken>();
  private unknownReferences: AssemblyToken[] = new Array<AssemblyToken>();

  public uri: Uri;
  public lines: AssemblyLine[] = new Array<AssemblyLine>();
  public referencedDocuments: string[] = new Array<string>();

  constructor(private symbolManager: SymbolManager, document: TextDocument, range?: Range, cancelationToken?: CancellationToken) {
    this.uri = document.uri;
    this.parse(document, range, cancelationToken);
  }

  private processTokens(uri: Uri, line: AssemblyLine, processReferences = true): void {
    line.tokens.forEach(token => {
      switch(token.kind) {
        case CompletionItemKind.Method:
        case CompletionItemKind.Struct:
        case CompletionItemKind.Constant:
        case CompletionItemKind.Variable:
        case CompletionItemKind.Class:
        case CompletionItemKind.Function:
          token.uri = uri;
          this.definitions.push(token);
          if (processReferences) {
            const unknownReferences = this.unknownReferences.filter(r => r.text == token.text && r.blockNumber == token.blockNumber);
            unknownReferences.forEach(r => {
              r.parent = token;
              token.children.push(r);
              const index = this.unknownReferences.indexOf(r);
              if (index > -1) {
                this.unknownReferences.splice(index, 1);
              }
            });
          }
          this.symbolManager.addDefinition(new AssemblySymbol(token.text, token.range, line.comment, token.kind, line.lineRange, uri, token.value));
          this.symbolManager.addToken(token);
          break;
        case CompletionItemKind.File:
          const filename = path.join(path.dirname(this.uri.fsPath), token.text.trim());
          if (this.referencedDocuments.indexOf(filename) < 0) {
            this.referencedDocuments.push(filename);
            this.processDocumentsQueue.enqueue(filename);
          }
          break;
        case CompletionItemKind.Reference:
          if (processReferences) {
            if (Registers.findIndex(r => r === token.text.toLocaleLowerCase()) < 0) {
              token.uri = uri;
              const definition = this.definitions.find(d => d.text === token.text && d.blockNumber == token.blockNumber);
              if (definition) {
                definition.children.push(token);
                token.parent = definition;
              } else {
                this.unknownReferences.push(token);
              }

              this.symbolManager.addReference(new AssemblySymbol(token.text, token.range, '', token.kind, line.lineRange, uri));
            }
          }
          break;
      }
    });
  }

  private parse(document: TextDocument, range?: Range, cancelationToken?: CancellationToken): void {
    if (document.lineCount <= 0) {
      return;
    }

    if (!range) {
      range = new Range(new Position(0, 0), new Position(document.lineCount - 1, 0));
    }

    this.symbolManager.clearDocument(document.uri);
    let state: ParserState;
    for (let i = range.start.line; i <= range.end.line; i++) {
      if (cancelationToken && cancelationToken.isCancellationRequested) {
        return;
      }

      const line = document.lineAt(i);
      const asmLine = new AssemblyLine(line.text, line.lineNumber);
      state = asmLine.parse(state);
      this.lines.push(asmLine);
      this.processTokens(this.uri, asmLine);
    }

    // Post process references
    

    // Post process referenced documents
    let filePath = '';
    while(filePath = this.processDocumentsQueue.dequeue()) {
      try {
        // Only process files that exist and are files and we have not seen before
        const stats = fs.statSync(filePath);
        if (stats && stats.isFile()) {
          fs.accessSync(filePath, fs.constants.R_OK);
          const uri = Uri.parse(fileUrl(filePath, {resolve: false}));
          this.symbolManager.clearDocument(uri);
          let lineNumber = 0;
          let state:ParserState;
          lineReader.eachLine(filePath, line => {
            const asmLine = new AssemblyLine(line, lineNumber++);
            state = asmLine.parse(state);
            this.processTokens(uri, asmLine, false); // ignore references
          });
        }
      } catch(e) {
        console.log(`[asm6x09] File ${filePath} is not readable to find referenced symbols:`);
        if (e instanceof Error) {
          console.log(e.message);
        } else {
          console.log(JSON.stringify(e));
        }
      }
    }
  }
}
