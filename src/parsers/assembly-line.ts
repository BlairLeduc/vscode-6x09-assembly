import { Position, Range } from 'vscode';

export class AssemblyLine {
  public label = '';
  public labelRange: Range;
  public opcode = '';
  public opcodeRange: Range;
  public operand = '';
  public operandRange: Range;
  public comment = '';
  public commentRange: Range;
  public reference = '';
  public referenceRange: Range;
  public startOfLine: Position;
  public endOfLine: Position;
  public lineRange: Range;
  public lineNumber = 0;

  constructor(private rawLine: string, rawLineNumber?: number) {
    if (rawLineNumber) {
      this.lineNumber = rawLineNumber;
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
      this.fillOperand(match[2], this.fillOpcode(match[1]));
      return;
    }
    match = this.matchLabelAndComment(this.rawLine);
    if (match) {
      this.fillComment(match[2], this.fillLabel(match[1]));
      return;
    }
    match = this.matchLabelOpcodeAndComment(this.rawLine);
    if (match) {
      this.fillComment(match[3], this.fillOpcode(match[2], this.fillLabel(match[1])));
      return;
    }
    match = this.matchLabelOpcodeOperandAndComment(this.rawLine);
    if (match) {
      this.fillComment(match[4], this.fillOperand(match[3], this.fillOpcode(match[2], this.fillLabel(match[1]))));
      return;
    }
  }
  private getPositon(index: number): Position {
    return new Position(this.lineNumber, index);
  }
  private getRange(from: number, to: number): Range {
    return new Range(new Position(this.lineNumber, from), new Position(this.lineNumber, to));
  }
  private matchSymbol(text: string): RegExpMatchArray {
    return text.match(/([a-z._][a-z0-9.$_@]*)/i);
  }
  private matchLineComment(text: string): RegExpMatchArray {
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
  private matchLabelOpcodeOperandAndComment(text: string): RegExpMatchArray {
    return text.match(/^([^ \t*;]*)(?:[ \t]+([^ \t]+))?(?:[ \t]+((?:"[^"]*"|\/[^\/]*\/|'[^']*'|[^ \t]*)))?(?:[ \t]+(.*))?/i);
  }
  private fillLabel(text: string, pos = 0): number {
    if (text && text.length > 0) {
      this.label = text;
      const start = this.rawLine.indexOf(this.label, pos);
      pos = start + this.label.length;
      this.labelRange = this.getRange(start, pos);
    }
    return pos;
  }
  private fillOpcode(text: string, pos = 0): number {
    if (text && text.length > 0) {
      this.opcode = text;
      const start = this.rawLine.indexOf(this.opcode, pos);
      pos = start + this.opcode.length;
      this.opcodeRange = this.getRange(start, pos);
    }
    return pos;
  }
  private fillOperand(text: string, pos = 0): number {
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
  private fillComment(text: string, pos = 0): number {
    if (text && text.length > 0) {
      this.comment = text.trim();
      const start = this.rawLine.indexOf(this.comment, pos);
      pos = start + this.comment.length;
      this.commentRange = this.getRange(start, pos);
    }
    return pos;
  }
}
