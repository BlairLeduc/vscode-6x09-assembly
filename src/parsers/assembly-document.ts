import { CancellationToken, CompletionItemKind, Position, Range, TextDocument, Uri } from 'vscode';
import { AssemblyLine } from './assembly-line';

export class AssemblySymbol {
  constructor(
    public name: string,
    public range: Range,
    public documentation: string,
    public kind: CompletionItemKind,
    public lineRange: Range,
    public uri: Uri
  ) { }
}

export class AssemblyDocument {
  public uri: Uri;
  public lines: AssemblyLine[] = new Array<AssemblyLine>();
  public symbols: AssemblySymbol[] = new Array<AssemblySymbol>();
  public macros: AssemblySymbol[] = new Array<AssemblySymbol>();
  public references: AssemblySymbol[] = new Array<AssemblySymbol>();
  public referencedDocuments: string[] = new Array<string>();

  constructor(document: TextDocument, range?: Range, cancelationToken?: CancellationToken) {
    this.uri = document.uri;
    this.parse(document, range, cancelationToken);
  }

  public findLabel(startsWith: string): AssemblySymbol[] {
    return this.symbols.filter(s => s.name.startsWith(startsWith));
  }

  public findMacro(startsWith: string): AssemblySymbol[] {
    return this.macros.filter(m => m.name.startsWith(startsWith));
  }

  public getMacro(name: string): AssemblySymbol {
    return this.macros.find(m => m.name === name);
  }

  public findReferences(name: string, includeLabel: boolean): AssemblySymbol[] {
    const symbols = this.references.filter(s => s.name === name);
    if (includeLabel) {
      const symbolDef = this.symbols.find(s => s.name === name);
      if (symbolDef) {
        symbols.push(symbolDef);
      }
      const macroDef = this.macros.find(m => m.name === name);
      if (macroDef) {
        symbols.push(macroDef);
      }
    }
    return symbols;
  }

  public getSymbol(name: string): AssemblySymbol {
    return this.symbols.find(s => s.name === name);
  }

  private parse(document: TextDocument, range?: Range, cancelationToken?: CancellationToken): void {
    if (document.lineCount <= 0) {
      return;
    }

    if (!range) {
      range = new Range(new Position(0, 0), new Position(document.lineCount - 1, 0));
    }

    for (let i = range.start.line; i <= range.end.line; i++) {
      if (cancelationToken && cancelationToken.isCancellationRequested) {
        return;
      }

      const line = document.lineAt(i);
      const asmLine = new AssemblyLine(line.text, line.lineNumber);
      this.lines.push(asmLine);
      if (this.isMacroDefinition(asmLine)) {
        this.macros.push(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Function, asmLine.lineRange, this.uri));
      } else if (this.isStructDefintion(asmLine)) {
        this.symbols.push(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Struct, asmLine.lineRange, this.uri));
      } else if (this.isStorageDefinition(asmLine)) {
        this.symbols.push(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Variable, asmLine.lineRange, this.uri));
      } else if (this.isConstantDefinition(asmLine)) {
        this.symbols.push(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Constant, asmLine.lineRange, this.uri));
      } else if (asmLine.label) {
        this.symbols.push(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment, CompletionItemKind.Method, asmLine.lineRange, this.uri));
      }
      if (asmLine.reference) {
        this.references.push(new AssemblySymbol(asmLine.reference, asmLine.referenceRange, '', CompletionItemKind.Reference, asmLine.lineRange, this.uri));
      }
    }

    // Post process references, remove anything that is not in the symbols
    this.references.forEach((reference, index, array) => {
      const symbol = this.symbols.find(s => s.name === reference.name);
      if (!symbol) {
        array.splice(index, 1);
      }
    });

    // Post process macros, find macros
    this.lines.forEach(line => {
      if (line.opcode) {
        const macro = this.macros.find(m => m.name === line.opcode);
        if (macro) {
          this.references.push(new AssemblySymbol(line.opcode, line.opcodeRange, macro.documentation, macro.kind, line.lineRange, this.uri));
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
}
