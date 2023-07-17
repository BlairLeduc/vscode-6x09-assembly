import * as vscode from 'vscode';
import { CancellationToken, Position, Range, TextDocument, Uri } from 'vscode';
import { AssemblyLine, ParserState } from './assembly-line';
import { AssemblyBlock, AssemblySymbol } from '../common';
import * as lineReader from 'line-reader';
import * as fs from 'fs';
import { Queue } from '../queue';
import { SymbolManager } from '../managers/symbol';
// import { LoggingDebugSession } from 'vscode-debugadapter';

export class AssemblyDocument {
  private processDocumentsQueue: Queue<vscode.Uri> = new Queue<vscode.Uri>();
  private unknownReferences: AssemblySymbol[] = new Array<AssemblySymbol>();
  private unknownTypes: AssemblySymbol[] = new Array<AssemblySymbol>();
  public uri: Uri;
  public lines: AssemblyLine[] = new Array<AssemblyLine>();
  public referencedDocuments: vscode.Uri[] = new Array<vscode.Uri>();
  public symbols: AssemblySymbol[] = new Array<AssemblySymbol>();
  public blocks: Map<number, AssemblyBlock> = new Map<number, AssemblyBlock>();

  constructor(private symbolManager: SymbolManager, document: TextDocument, range?: Range, cancelationToken?: CancellationToken) {
    this.uri = document.uri;
    this.parse(document, range, cancelationToken);
  }

  private pathJoin(...paths: string[]): string {
    return paths.map(p => p.replace(/[\/\s]+$/,'')).join('/');
  }

  private appendPath(uri: vscode.Uri, ...paths: string[]): vscode.Uri {
    return uri.with({ path: this.pathJoin(uri.path, ...paths) });
  }

  private processLine(uri: Uri, line: AssemblyLine, block?: AssemblyBlock): void {

    if (line.label) {
      const definition = line.label;

      definition.uri = uri;
      this.symbols.push(definition);
      if (block) {
        block.symbols.push(definition);
      }
      
      this.unknownReferences.filter(r => r.text === definition.text && r.blockNumber === definition.blockNumber).forEach(r => {
        r.definition = definition;
        r.semanticToken.type = definition.semanticToken.type;
        r.semanticToken.modifiers = definition.semanticToken.modifiers;
        definition.references.push(r);
        
        if (block) {
          block.symbols.push(r);
        }

        r.properties.forEach(property => {
          property.definition = definition.properties.find(p => p.text === property.text);
        });
        const index = this.unknownReferences.indexOf(r);
        if (index > -1) {
          this.unknownReferences.splice(index, 1);
        }
      });

      this.unknownTypes.filter(t => t.text === definition.text).forEach(t => {
        t.definition = definition;
        definition.references.push(t);
        const index = this.unknownTypes.indexOf(t);
        if (index > -1) {
          this.unknownTypes.splice(index, 1);
        }
      });

      this.symbolManager.addSymbol(definition);
    }

    line.references.forEach(reference => {
      reference.uri = uri;
      const definition = this.symbols.find(d => d.text === reference.text && d.blockNumber === reference.blockNumber);

      if (definition) {
        definition.references.push(reference);
        reference.definition = definition;
        reference.semanticToken.type = definition.semanticToken.type;
        reference.semanticToken.modifiers = definition.semanticToken.modifiers;
        reference.properties.forEach(propertyReference => {
          propertyReference.uri = uri;
          const property = definition.definition?.properties.find(p => p.text === propertyReference.text);
          if (property) {
            propertyReference.definition = property;
            property.references.push(propertyReference);
          }
        });
      } else {
        this.unknownReferences.push(reference);
      }
    });

    if (line.file) {
      const uri = this.appendPath(this.uri, line.file);
      if (this.referencedDocuments.indexOf(uri) < 0) {
        this.referencedDocuments.push(uri);
        this.processDocumentsQueue.enqueue(uri);
      }
    }

    // A type (struct) is referenced in the opcode column
    if (line.type) {
      const typeReference = line.type;
      const type = line.type;
      typeReference.uri = uri;

      const definition = this.symbols.find(t => t.text === typeReference.text);
      if (definition) {
        definition.references.push(type);
        type.definition = definition;
      } else {
        this.unknownTypes.push(typeReference);
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
      const asmLine = new AssemblyLine(line.text, undefined, line.lineNumber);
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
    let uri: vscode.Uri | undefined;
    while (uri = this.processDocumentsQueue.dequeue()) {
      try {
        // Only process files that exist and are files and we have not seen before
        const filepath = uri.fsPath;
        const stats = fs.statSync(filepath);
        if (stats && stats.isFile()) {
          fs.accessSync(filepath, fs.constants.R_OK);
          this.symbolManager.clearDocument(uri);
          let lineNumber = 0;
          let state: ParserState;
          lineReader.eachLine(filepath, line => {
            const asmLine = new AssemblyLine(line, state, lineNumber++);
            this.processLine(uri!, asmLine);
            state = asmLine.state;
          });
        }
      } catch (e) {
        console.log(`[asm6x09] File ${uri.fsPath} is not readable to find referenced symbols:`);
        if (e instanceof Error) {
          console.log(e.message);
        } else {
          console.log(JSON.stringify(e));
        }
      }
    }
  }
}
