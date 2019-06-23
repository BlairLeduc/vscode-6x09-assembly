import { Position, Range, TextLine, TextDocument, CancellationToken } from 'vscode';

export class AsmLine {
  public label: string = '';
  public labelRange: Range;

  public opcode: string = '';
  public opcodeRange: Range;

  public operand: string = '';
  public operandRange: Range;

  public comment: string = '';
  public commentRange: Range;

  public startOfLine: Position;
  public endOfLine: Position;

  public error: string;
  public errorRange: Range;

  private lineNumber: number = 0;

  constructor(private rawLine: string, private textLine?: TextLine) {
    if (textLine) {
      this.lineNumber = this.textLine.lineNumber;
    }

    this.startOfLine = this.getPositon(0);
    this.endOfLine = this.getPositon(this.rawLine.length);
    this.labelRange = this.getRange(0, 0);
    this.opcodeRange = this.getRange(0, 0);
    this.opcodeRange = this.getRange(0, 0);
    this.commentRange = this.getRange(0, 0);

    this.parse();
  }

  private parse(): void {
    if (this.isCommentLine()) {
      this.comment = this.rawLine;
      this.commentRange = this.getRange(0, this.rawLine.length);
    } else {
      let index = 0;

      if (this.isStartOfLabel(index)) {
        const len = this.getLabelLength(index);
        if (!this.isWhitespace(this.rawLine.charAt(index + len))) {
          this.error = 'Invalid Label';
          this.errorRange = this.getRange(index, index + len);
          return;
        }
        this.label = this.rawLine.substr(index, len);
        this.labelRange = this.getRange(index, index + len - 1);
        index += len;
      }
    }
  }

  private getPositon(index: number): Position {
    return new Position(this.lineNumber, index);
  }

  private getRange(from: number, to: number): Range {
    return new Range(new Position(this.lineNumber, from), new Position(this.lineNumber, to));
  }

  private isCommentLine() {
    return this.rawLine.charAt(0) === '*';
  }

  private isStartOfLabel(index: number): boolean {
    const ch = this.rawLine.charAt(index);
    return this.isLetter(ch) || ch === '.' || ch === '_';
  }

  private isPartOfLabel(ch: string): boolean {
    return  this.isLetter(ch) || this.isNumber(ch) || ch === '.' || ch === '$' || ch === '_';
  }

  private getLabelLength(index: number) {
    let len = 0;
    while (this.isPartOfLabel(this.rawLine.charAt(index + len))) {
      len++;
    }
    return len;
  }

  private isLetter(ch: string): boolean {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
  }

  private isNumber(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }

  private isWhitespace(ch: string): boolean {
    return ch === ' ' || ch === '\t';
  }
}

export class AsmDocument {
  public lines = new Array<AsmLine>();
  public symbols = new Array<string>();
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
      const asmLine = new AsmLine(line.text, line);
      this.lines.push(asmLine);
      if (asmLine.label) {
        this.symbols.push(asmLine.label);
      }
    }
  }
}
