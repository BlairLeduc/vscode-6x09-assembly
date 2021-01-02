import { CancellationToken, CompletionItemKind, Position, Range, TextDocument, Uri } from 'vscode';
import { AssemblyLine } from './assembly-line';
import { AssemblySymbol } from '../common';
import * as path from 'path';
import * as lineReader from 'line-reader';
import * as fileUrl from 'file-url';
import * as fs from 'fs';
import { SymbolManager } from '../managers/symbol';

export class AssemblyDocument {
  public uri: Uri;
  public lines: AssemblyLine[] = new Array<AssemblyLine>();
  public referencedDocuments: string[] = new Array<string>();

  constructor(private symbolManager: SymbolManager, document: TextDocument, range?: Range, cancelationToken?: CancellationToken) {
    this.uri = document.uri;
    this.parse(document, range, cancelationToken);
  }

  private parse(document: TextDocument, range?: Range, cancelationToken?: CancellationToken): void {
    if (document.lineCount <= 0) {
      return;
    }

    if (!range) {
      range = new Range(new Position(0, 0), new Position(document.lineCount - 1, 0));
    }

    this.symbolManager.clearDocument(document.uri);
    for (let i = range.start.line; i <= range.end.line; i++) {
      if (cancelationToken && cancelationToken.isCancellationRequested) {
        return;
      }

      const line = document.lineAt(i);
      const asmLine = new AssemblyLine(line.text, line.lineNumber);
      this.lines.push(asmLine);
      if (this.isMacroDefinition(asmLine)) {
        this.symbolManager.addDefinition(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Function, asmLine.lineRange, this.uri));
      } else if (this.isStructDefintion(asmLine)) {
        this.symbolManager.addDefinition(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Struct, asmLine.lineRange, this.uri));
      } else if (this.isStorageDefinition(asmLine)) {
        this.symbolManager.addDefinition(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Variable, asmLine.lineRange, this.uri));
      } else if (this.isConstantDefinition(asmLine)) {
        this.symbolManager.addDefinition(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Constant, asmLine.lineRange, this.uri));
      } else if (this.isFileReference(asmLine)) {
        this.referencedDocuments.push(path.join(path.dirname(this.uri.fsPath), asmLine.operand.trim()));
      } else if (asmLine.label) {
        this.symbolManager.addDefinition(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Method, asmLine.lineRange, this.uri));
      }
      if (asmLine.references.length > 0) {
        asmLine.references.forEach(reference => 
          this.symbolManager.addReference(new AssemblySymbol(reference.name, reference.range, '', CompletionItemKind.Reference, asmLine.lineRange, this.uri))
        );
      }
    }

    // Post process referenced documents
    this.referencedDocuments.forEach(filePath => {
      try {
        // Only process files that exist and are files
        const stats = fs.statSync(filePath);
        if (stats && stats.isFile()) {
          fs.accessSync(filePath, fs.constants.R_OK);
          const uri = Uri.parse(fileUrl(filePath, {resolve: false}));
          this.symbolManager.clearDocument(uri);
          let lineNumber = 0;
          lineReader.eachLine(filePath, line => {
            const asmLine = new AssemblyLine(line, lineNumber++);
            if (asmLine.label) {
              this.symbolManager.addDefinition(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Method, asmLine.lineRange, uri));
            }
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
    });

    // Post process macros, find macros
    this.lines.forEach(line => {
      if (line.opcode) {
        const macro = this.symbolManager.getMacro(line.opcode);
        if (macro) {
          this.symbolManager.addReference(new AssemblySymbol(line.opcode, line.opcodeRange, macro.documentation, macro.kind, line.lineRange, this.uri));
        }
      }
    });
  }

  private isMacroDefinition(line: AssemblyLine): boolean {
    return line.label && line.opcode && line.opcode.toUpperCase() === 'MACRO';
  }

  private isStructDefintion(line: AssemblyLine): boolean {
    return line.label && line.opcode && line.opcode.toUpperCase() === 'STRUCT';
  }

  private isStorageDefinition(line: AssemblyLine): boolean {
    return line.label && line.opcode && (line.opcode.match(/f[cdq]b|fc[cns]|[zr]m[dbq]|includebin|fill/i) !== null);
  }

  private isConstantDefinition(line: AssemblyLine): boolean {
    return line.label && line.opcode && (line.opcode.match(/equ|set/i) !== null);
  }

  private isFileReference(line: AssemblyLine): boolean {
    return line.opcode && (line.opcode.match(/use|include/i) !== null);
  }
}
