import { CancellationToken, Position, Range, TextDocument, Uri } from 'vscode';
import { AssemblyLine, ParserState } from './assembly-line';
import { AssemblyBlock, AssemblySymbol } from '../common';
import * as path from 'path';
import * as lineReader from 'line-reader';
import * as fileUrl from 'file-url';
import * as fs from 'fs';
import { SymbolManager } from '../managers/symbol';
import { Queue } from '../queue';
// import { LoggingDebugSession } from 'vscode-debugadapter';

export class AssemblyDocument {
  private processDocumentsQueue: Queue<string> = new Queue<string>();
  private unknownReferences: AssemblySymbol[] = new Array<AssemblySymbol>();

  public uri: Uri;
  public lines: AssemblyLine[] = new Array<AssemblyLine>();
  public referencedDocuments: string[] = new Array<string>();
  public symbols: AssemblySymbol[] = new Array<AssemblySymbol>();
  public blocks: Map<number, AssemblyBlock> = new Map<number, AssemblyBlock>();

  constructor(private symbolManager: SymbolManager, document: TextDocument, range?: Range, cancelationToken?: CancellationToken) {
    this.uri = document.uri;
    this.parse(document, range, cancelationToken);
  }

  private processLine(uri: Uri, line: AssemblyLine, block?: AssemblyBlock): void {

    if (line.label) {
      const definition = line.label;

      definition.uri = uri;
      this.symbols.push(definition);
      if (block) {
        block.symbols.push(definition);
      }
      
      const unknownReferences = this.unknownReferences.filter(r => r.text == definition.text && r.blockNumber == definition.blockNumber);
      unknownReferences.forEach(r => {
        r.definition = definition;
        r.semanticToken.type = definition.semanticToken.type;
        r.semanticToken.modifiers = definition.semanticToken.modifiers;
        definition.references.push(r);
        if (block) {
          block.symbols.push(r);
        }
        const index = this.unknownReferences.indexOf(r);
        if (index > -1) {
          this.unknownReferences.splice(index, 1);
        }
      });

      this.symbolManager.addToken(definition);
    }

    line.references.forEach(reference => {
      reference.uri = uri;
      const definition = this.symbols.find(d => d.text === reference.text && d.blockNumber == reference.blockNumber);
      if (definition) {
        definition.references.push(reference);
        reference.definition = definition;
        reference.semanticToken.type = definition.semanticToken.type;
        reference.semanticToken.modifiers = definition.semanticToken.modifiers;
      } else {
        this.unknownReferences.push(reference);
      }
    });

    if (line.file) {
      const filename = path.join(path.dirname(this.uri.fsPath), line.file);
      if (this.referencedDocuments.indexOf(filename) < 0) {
        this.referencedDocuments.push(filename);
        this.processDocumentsQueue.enqueue(filename);
      }
    }
  }

  private parse(document: TextDocument, range?: Range, cancelationToken?: CancellationToken): void {
    if (document.lineCount <= 0) {
      return;
    }

    if (!range) {
      range = new Range(new Position(0, 0), new Position(document.lineCount - 1, 0));
    }

    this.symbolManager.clearDocument(document.uri);
    let blockNumber = 1;
    let block = new AssemblyBlock(blockNumber, 0);
    this.blocks.set(blockNumber, block);

    let state: ParserState;

    for (let i = range.start.line; i <= range.end.line; i++) {
      if (cancelationToken && cancelationToken.isCancellationRequested) {
        return;
      }

      const line = document.lineAt(i);
      const asmLine = new AssemblyLine(line.text, state, line.lineNumber);
      this.lines.push(asmLine);

      state = asmLine.state;
      if (state.blockNumber > blockNumber) {
        block.endLineNumber = i - 1;
        if (block.endLineNumber - block.startLineNumber > 0) {
          this.blocks.set(blockNumber, block);
        }
        block = new AssemblyBlock(state.blockNumber, i + 1);
        blockNumber = state.blockNumber;
      }
      this.processLine(this.uri, asmLine, block);
    }

    // Post process referenced documents
    let filePath: string;
    while (filePath = this.processDocumentsQueue.dequeue()) {
      try {
        // Only process files that exist and are files and we have not seen before
        const stats = fs.statSync(filePath);
        if (stats && stats.isFile()) {
          fs.accessSync(filePath, fs.constants.R_OK);
          const uri = Uri.parse(fileUrl(filePath, { resolve: false }));
          this.symbolManager.clearDocument(uri);
          let lineNumber = 0;
          let state: ParserState;
          lineReader.eachLine(filePath, line => {
            const asmLine = new AssemblyLine(line, state, lineNumber++);
            this.processLine(uri, asmLine);
            state = asmLine.state;
          });
        }
      } catch (e) {
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
