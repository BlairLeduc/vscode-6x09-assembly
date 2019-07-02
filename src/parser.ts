import { CancellationToken, DocumentRangeFormattingEditProvider, Position, Range, TextDocument, TextLine } from 'vscode';

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

  private lineNumber: number = 0;
  private lineLength: number = 0;

  private commentRegExp: RegExp = RegExp('^([*;].*)');
  private lineRegExp: RegExp = RegExp('^([^ \t*;]*)(?:[ \t]+([^ \t*;]+))?(?:[ \t]+((?![*;])(?:"[^"]*"|/[^/]*/|[^ \t]*)))?(?:[ \t]+(.*))?');
  private symbolRegExp: RegExp = RegExp('[a-zA-Z._][a-zA-Z0-9.$_@]*');

  constructor(private rawLine: string, private textLine?: TextLine) {
    if (textLine) {
      this.lineNumber = this.textLine.lineNumber;
    }

    this.lineLength = this.rawLine.length;

    this.startOfLine = this.getPositon(0);
    this.endOfLine = this.getPositon(this.rawLine.length);
    this.labelRange = this.getRange(0, 0);
    this.opcodeRange = this.getRange(0, 0);
    this.operandRange = this.getRange(0, 0);
    this.commentRange = this.getRange(0, 0);
    this.referenceRange = this.getRange(0, 0);

    this.parse();
  }

  private parse(): void {

    let match = this.commentRegExp.exec(this.rawLine);
    if (match) {
      this.comment = match[1];
      this.commentRange = this.getRange(match.index, this.lineLength);
    } else {
      match = this.lineRegExp.exec(this.rawLine);
      if (match) {
        let pos = 0;
        // Label
        if (match[1]) {
          this.label = match[1];
          pos = this.label.length;
          this.labelRange = this.getRange(0, pos);
        }
        // Opcode
        if (match[2]) {
          this.opcode = match[2];
          const start = this.rawLine.indexOf(this.opcode, pos);
          pos = start + this.opcode.length;
          this.opcodeRange = this.getRange(start, pos);
        }
        // Operand
        if (match[3]) {
          this.operand = match[3];
          const start = this.rawLine.indexOf(this.operand, pos);
          pos = start + this.operand.length;
          this.operandRange = this.getRange(start, pos);
          // Reference?
          if (!/"[^"]*"|\/[^/]*\//.exec(this.operand)) {
            // not a string
            const refMatch = this.symbolRegExp.exec(this.operand);
            if (refMatch) {
              this.reference = refMatch[0];
              const refStart = start + refMatch.index;
              this.referenceRange = this.getRange(refStart, refStart + this.reference.length);
            }
          }
        }
        // Comment
        if (match[4]) {
          this.comment = match[4];
          const start = this.rawLine.indexOf(this.comment);
          this.commentRange = this.getRange(start, start + this.comment.length);
        }
      }
    }
  }

  private getPositon(index: number): Position {
    return new Position(this.lineNumber, index);
  }

  private getRange(from: number, to: number): Range {
    return new Range(new Position(this.lineNumber, from), new Position(this.lineNumber, to));
  }
}

export class AssemblySymbol {
  constructor(public name: string, public range: Range, public documentation: string) { }
}

export class AssemblyDocument {
  public lines: AssemblyLine[] = new Array<AssemblyLine>();
  public symbols: AssemblySymbol[] = new Array<AssemblySymbol>();
  public references: AssemblySymbol[] = new Array<AssemblySymbol>();

  constructor(private document: TextDocument) {
    this.parse(document);
  }

  public findLabel(startsWith: string): AssemblySymbol[] {
    return this.symbols.filter(s => s.name.startsWith(startsWith));
  }

  public findReferences(name: string, includeLabel: boolean): AssemblySymbol[] {
    const symbols = this.references.filter(s => s.name === name);
    if (includeLabel) {
      symbols.push(this.symbols.find(s => s.name === name));
    }
    return symbols;
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
      if (asmLine.label) {
        this.symbols.push(new AssemblySymbol(asmLine.label, asmLine.labelRange, asmLine.comment));
      }
      if (asmLine.reference) {
        this.references.push(new AssemblySymbol(asmLine.reference, asmLine.referenceRange, ''));
      }
    }

    // Post process references, remove anything that is not in the symbols
    this.references.forEach( (value, index, array) => {
      if (!this.symbols.find(s => s.name === value.name)) {
        array.splice(index, 1);
      }
    });
  }
}
