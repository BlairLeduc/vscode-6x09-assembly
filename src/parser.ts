import { CancellationToken, CompletionItemKind, Position, Range, TextDocument, TextLine, Uri } from 'vscode';

export class AssemblyLine {
  public label: string = '';
  public labelRange: Range;

  public opcode: string = '';
  public opcodeRange: Range;

  public operand: string = '';
  public operandRange: Range;

  public comment: string = '';
  public commentRange: Range;

  public reference: string = '';
  public referenceRange: Range;

  public startOfLine: Position;
  public endOfLine: Position;
  public lineRange: Range;

  private lineNumber: number = 0;

  constructor(private rawLine: string, private textLine?: TextLine) {
    if (textLine) {
      this.lineNumber = this.textLine.lineNumber;
    }

    this.startOfLine = this.getPositon(0);
    this.endOfLine = this.getPositon(this.rawLine.length);
    this.lineRange = this.getRange(0, this.rawLine.length);
    this.labelRange = this.getRange(0, 0);
    this.opcodeRange = this.getRange(0, 0);
    this.operandRange = this.getRange(0, 0);
    this.commentRange = this.getRange(0, 0);
    this.referenceRange = this.getRange(0, 0);

    this.parse();
  }

  private parse(): void {

    let match = this.matchLineComment(this.rawLine);
    if (match !== null) {
      this.fillComment(match[1]);
      return;
    }

    match = this.matchSelectPseudoOps(this.rawLine);
    if (match) {
      this.fillOperand(match[2],
        this.fillOpcode(match[1]));
      return;
    }

    match = this.matchLabelAndComment(this.rawLine);
    if (match) {
      this.fillComment(match[2],
        this.fillLabel(match[1]));
      return;
    }

    match = this.matchLabelOpcodeAndComment(this.rawLine);
    if (match) {
      this.fillComment(match[3],
        this.fillOpcode(match[2],
          this.fillLabel(match[1])));
      return;
    }

    match = this.matchLabelOpcodeOperandAndComment(this.rawLine);
    if (match) {
      this.fillComment(match[4],
        this.fillOperand(match[3],
          this.fillOpcode(match[2],
            this.fillLabel(match[1]))));
      return;
    }
  }

  private getPositon(index: number): Position {
    return new Position(this.lineNumber, index);
  }

  private getRange(from: number, to: number): Range {
    return new Range(new Position(this.lineNumber, from), new Position(this.lineNumber, to));
  }

  private matchSymbol(text: string) {
    return text.match(/([a-z._][a-z0-9.$_@]*)/i);
  }

  private matchLineComment(text: string) {
    const match = text.match(/(?:^\s*)[*](?:\s|[*])(.*)/);
    if (match) {
      return match;
    }
    return text.match(/(?:^\s*)[;](.*)/);
  }

  private matchSelectPseudoOps(text: string): RegExpMatchArray {
    return text.match(/^[ \t]+(nam|ttl|use|include(?:bin)?|error|warning)[ \t]+(.*)/);
  }

  private matchLabelAndComment(text: string): RegExpMatchArray {
    return text.match(/^([^ \t*;]*)(?:[ \t]+(?:[*]\s|;)(.*))/);
  }

  private matchLabelOpcodeAndComment(text: string): RegExpMatchArray {
    return text.match(/^([^ \t*;]*)(?:[ \t]+(abx|as[lr][abd]|clr[abdefw]|com[abdefw]|daa|dec[abdefw]|inc[abdefw]|ls[lr][abdw]|mul|neg[abd]|nop|psh[su]w|pul[su]w|ro[lr][abdw]|rt[is]|sexw?|swi[23]?|tst[abdefw]|macro|struct))(?:[ \t]+(.*))/i);
  }

  private matchLabelOpcodeOperandAndComment(text: string) {
    return text.match(/^([^ \t*;]*)(?:[ \t]+([^ \t]+))?(?:[ \t]+((?:"[^"]*"|\/[^\/]*\/|'[^']*'|[^ \t]*)))?(?:[ \t]+(.*))?/i);
  }

  private fillLabel(text: string, pos: number = 0): number {
    if (text && text.length > 0) {
      this.label = text;
      const start = this.rawLine.indexOf(this.label, pos);
      pos = start + this.label.length;
      this.labelRange = this.getRange(start, pos);
    }
    return pos;
  }

  private fillOpcode(text: string, pos: number = 0): number {
    if (text && text.length > 0) {
      this.opcode = text;
      const start = this.rawLine.indexOf(this.opcode, pos);
      pos = start + this.opcode.length;
      this.opcodeRange = this.getRange(start, pos);
    }
    return pos;
  }

  private fillOperand(text: string, pos: number = 0): number {
    if (text && text.length > 0) {
      this.operand = text;
      const start = this.rawLine.indexOf(this.operand, pos);
      pos = start + this.operand.length;
      this.operandRange = this.getRange(start, pos);
      // Reference?
      if (!/"[^"]*"|\/[^/]*\//.exec(this.operand)) {
        // not a string
        const refMatch = this.matchSymbol(this.operand);
        if (refMatch) {
          this.reference = refMatch[0];
          const refStart = start + refMatch.index;
          this.referenceRange = this.getRange(refStart, refStart + this.reference.length);
        }
      }
    }
    return pos;
  }

  private fillComment(text: string, pos: number = 0): number {
    if (text && text.length > 0) {
      this.comment = text.trim();
      const start = this.rawLine.indexOf(this.comment, pos);
      pos = start + this.comment.length;
      this.commentRange = this.getRange(start, pos);
    }
    return pos;
  }
}

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

  constructor(document: TextDocument) {
    this.uri = document.uri;
    this.parse(document);
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

  private parse(document: TextDocument, range?: Range, cancelationToken?: CancellationToken) {
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
      const asmLine = new AssemblyLine(line.text, line);
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
