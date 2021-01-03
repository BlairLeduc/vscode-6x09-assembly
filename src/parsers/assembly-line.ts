import { CompletionItemKind, Position, Range } from 'vscode';
import { AssemblyToken, Registers } from '../common';

interface FoundToken {
  type: string;
  name: string;
  start: number;
}

export interface SymbolReference {
  name: string;
  range: Range;
  token: AssemblyToken;
}

export interface ParserState {
  lonelyLabels: AssemblyToken[];
  blockNumber: number;
}

export class AssemblyLine {
  private static constantRegExp: RegExp;
  private static opcodeRegExp: RegExp;
  private static pseudoRegExp: RegExp;
  private static storageRegExp: RegExp;

  public lineNumber = 0;
  public lineRange: Range;
  public blockNumber = 0;

  public label = '';
  public labelRange: Range;
  public opcode = '';
  public opcodeRange: Range;
  public operand = '';
  public operandRange: Range;
  public comment = '';

  public tokens: AssemblyToken[];
  public references: SymbolReference[];

  constructor(private rawLine: string, rawLineNumber?: number) {
    if (rawLineNumber) {
      this.lineNumber = rawLineNumber;
    }
    this.lineRange = this.getRange(0, this.rawLine.length);

    this.labelRange = this.getRange(0, 0);
    this.opcodeRange = this.getRange(0, 0);
    this.operandRange = this.getRange(0, 0);

    this.tokens = [];
    this.references = [];

    if (!AssemblyLine.constantRegExp) {
      AssemblyLine.constantRegExp = new RegExp(/equ|set/i);
    }

    if (!AssemblyLine.opcodeRegExp) {
      const ob = 'c[cs]|eq|g[et]|h[is]|l[eost]|mi|ne|pl|r[an]|sr|v[cs]';
      const o1 = 'a(bx|dc[abdr]|dd[abdefrw]|im|nd([abdr]|cc)|s[lr][abd]?)|b(' + ob + '|i?and|i?eor|i?or|it([abd]|md))';
      const o2 = '|clr[abdefw]?|cmp[abefdwxyrsu]|com[abdefw]?|cwia|daa|dec[abdefw]?|div[dq]|e(im|or[abdr]|xg)|inc[abdefw]?';
      const o3 = '|j(mp|sr)|lb(' + ob + ')|ld([abdrfwxyusuq]|bt|md)|lea[xysu]|ls[lr][abdw]?|muld?|neg[abd]?|nop';
      const o4 = '|o(im|r([abdr]|cc))|psh[su]w?|pul[su]w?|ro[lr][abdw]?|rt[is]';
      const o5 = '|sbc[abdr]|sexw?|st([abefdwxysuq]|bt)|sub[abdr]|swi[23]?|sync|t(fm|fr|im|st[abdefw]?)';
      AssemblyLine.opcodeRegExp = new RegExp('^(' + o1 + o2 + o3 + o4 + o5 + ')$', 'i');
    }

    if (!AssemblyLine.pseudoRegExp) {
      const p1 = '([.](4byte|asci[isz]|area|blkb|byte|d[bsw]|globl|module|quad|rs|str[sz]?|word))|([*]?pragma(push|pop)?)|align';
      const p2 = '|e(lse|mod|nd([cms]|sect(ion)?|struct)?|qu|rror|xport|xtdep|xtern(al)?)|fc[bcns]|fdb|f(ill|qb)';
      const p3 = '|if(def|eq|g[et]|l[et]|ndef|ne|pragma)|import|include(bin)?|m(acro|od)|nam|o(rg|s9)|pragma|rm[bdq]|set(dp)?';
      const p4 = "|struct|use|warning|zm[bdq]";
      AssemblyLine.pseudoRegExp = new RegExp('^(' + p1 + p2 + p3 + p4 + ')$', 'i');
    }

    if(!AssemblyLine.storageRegExp) {
      const s1 = '[.](4byte|asci[isz]|blkb|byte|d[bsw]|globl|quad|rs|str[sz]?|word)|f[dq]b|fc[bcns]|import|export|[zr]m[dbq]';
      const s2 = '|includebin|fill';
      AssemblyLine.storageRegExp = new RegExp('^(' + s1 + s2 + ')$', 'i');
    }
  }

  public parse(state: ParserState): ParserState {
    if (!state) {
      state = { lonelyLabels: [], blockNumber: 1 } as ParserState;
    }

    if (this.rawLine.trim() === '') {
      state.blockNumber++;
      return state;
    }

    this.blockNumber = state.blockNumber;

    let match = this.matchLineComment(this.rawLine);
    if (match !== null) {
      this.fillComment(match[1]);
      return state;
    }
    match = this.matchSelectPseudoOps(this.rawLine);
    if (match) {
      this.fillOperand(match[2], this.fillOpcode(match[1]));
      return state;
    }
    match = this.matchLabelAndComment(this.rawLine);
    if (match) {
      const [_, labelToken] = this.fillComment(match[2], this.fillLabel(match[1], state.blockNumber));
      if (labelToken) {
        state.lonelyLabels.push(labelToken);
      }
      return state;
    }
    match = this.matchLabelOpcodeAndComment(this.rawLine);
    if (match) {
      const [_1, _2, opCodeToken] = this.fillComment(match[3], this.fillOpcode(match[2], this.fillLabel(match[1], state.blockNumber)));
      this.updateLonelyLabelsFromOpcode(state, opCodeToken);
      return state;
    }
    match = this.matchLabelOpcodeOperandAndComment(this.rawLine);
    if (match) {
      const [_, labelToken, opCodeToken] = this.fillComment(match[4], this.fillOperand(match[3], this.fillOpcode(match[2], this.fillLabel(match[1], state.blockNumber))));
      if (labelToken && !opCodeToken) {
        state.lonelyLabels.push(labelToken);
      }
      if (opCodeToken) {
        this.updateLonelyLabelsFromOpcode(state, opCodeToken);
      }
      return state;
    }
    return state;
  }

  private updateLonelyLabelsFromOpcode(state: ParserState, opCodeToken: AssemblyToken) {
    state.lonelyLabels.forEach(label => {
      this.updateLabelTokenFromOpcode(label, opCodeToken.text);
    });
    state.lonelyLabels = [];
  }

  private updateLabelTokenFromOpcode(labelToken: AssemblyToken, text: string) {
    if (labelToken) {
      if (AssemblyLine.constantRegExp.test(text)) {
        labelToken.tokenType = 'variable';
        labelToken.tokenModifiers = ['readonly', 'definition'];
        labelToken.kind = CompletionItemKind.Constant;
      } else if (AssemblyLine.storageRegExp.test(text)) {
        labelToken.tokenType = 'variable';
        labelToken.tokenModifiers = ['definition'];
        labelToken.kind = CompletionItemKind.Variable;
      } else if (text.toLowerCase() === 'macro') {
        labelToken.tokenType = 'macro';
        labelToken.tokenModifiers = ['declaration'];
        labelToken.kind = CompletionItemKind.Method;
      } else if (text.toLowerCase() === 'struct') {
        labelToken.tokenType = 'struct';
        labelToken.tokenModifiers = ['declaration'];
        labelToken.kind = CompletionItemKind.Struct;
      }
    }
  }

  private getRange(from: number, to: number): Range {
    return new Range(new Position(this.lineNumber, from), new Position(this.lineNumber, to));
  }

  private matchLineComment(text: string): RegExpMatchArray {
    let match = text.match(/(?:^\s*)[*](?:\s|[*])(.*)/);
    if (match) {
      return match;
    }
    match = text.match(/^[*]\s?(.*)/)
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

  private fillLabel(text: string, blockNumber: number): [number, AssemblyToken, AssemblyToken] {
    if (text && text.length > 0) {
      const start = this.rawLine.indexOf(text, 0);
      const pos = start + text.length;
      const range = this.getRange(start, pos);

      // Populate variables
      this.label = text;
      this.labelRange = range;

      // Create and add token
      const isLocal = this.isLocal(text);
      const token = new AssemblyToken(text, range, this.lineRange,
        isLocal ? CompletionItemKind.Function : CompletionItemKind.Class,
        isLocal ? 'function' : 'class',
        [ 'definition' ]);
      token.blockNumber = isLocal ? blockNumber : 0;

      this.tokens.push(token);
      return [pos, token, null];
    }
    return [0, null, null];
  }

  private isLocal(text: string) {
    return text.match(/.*[@$?].*/);
  }

  private fillOpcode(text: string, last: [number, AssemblyToken, AssemblyToken] = [0, null, null]): [number, AssemblyToken, AssemblyToken] {
    if (text && text.length > 0) {
      let [pos, labelToken] = last;
      const start = this.rawLine.indexOf(text, pos);
      pos = start + text.length;
      const range = this.getRange(start, pos);

      // Populate variables
      this.opcode = text;
      this.opcodeRange = range;

      // Create and add token
      let token = null;

      if (AssemblyLine.opcodeRegExp.test(text) || AssemblyLine.pseudoRegExp.test(text)) {
        token = new AssemblyToken(text, range, this.lineRange, CompletionItemKind.Keyword, 'keyword');
      } else {
        token = new AssemblyToken(text, range, this.lineRange, CompletionItemKind.Method, 'macro'); 
      }

      this.tokens.push(token);
      
      // Update label token (if there is one) based on the opcode
      this.updateLabelTokenFromOpcode(labelToken, text);

      return [pos, labelToken, token];
    }
    return last;
  }

  private fillOperand(text: string, last: [number, AssemblyToken, AssemblyToken] = [0, null, null]): [number, AssemblyToken, AssemblyToken] {
    if (text && text.length > 0) {
      let [pos, labelToken, opCodeToken] = last;

      const start = this.rawLine.indexOf(text, pos);
      pos = start + text.length;
      const range = this.getRange(start, pos);

      // Populate variables
      this.operand = text;
      this.operandRange = range;

      // Create and add tokens
      if (opCodeToken && opCodeToken.text.match(/use|include/i)) {
        // File references
        this.tokens.push(new AssemblyToken(text, range, this.lineRange, CompletionItemKind.File, 'string'));
      } else if (text.match(/"[^"]*"|'[^']*'|\/[^/]*\//)) { // Is this a string?
        // String
        this.tokens.push(new AssemblyToken(text, range, this.lineRange, CompletionItemKind.Value, 'string'));
      } else if (opCodeToken && opCodeToken.text.match(/error|warning|fail|opt|nam|ttl|pag|spc/i)) {
        // psuedo op with operand
        this.tokens.push(new AssemblyToken(text, range, this.lineRange, CompletionItemKind.Value, 'string'));
      } else {
        if (labelToken && labelToken.kind === CompletionItemKind.Constant) {
          labelToken.value = text;
        }

        this.getTokensFromExpression(text).forEach(operandToken => {
          const refStart = start + operandToken.start;
          const refRange = this.getRange(refStart, refStart + operandToken.name.length);
          const kind = operandToken.type === 'variable' ? CompletionItemKind.Reference 
                        : operandToken.type === 'number' ? CompletionItemKind.Value
                        : CompletionItemKind.Operator;
          const token = new AssemblyToken(operandToken.name, refRange, this.lineRange, kind, operandToken.type);
          if (this.isLocal(token.text)) {
            token.blockNumber = this.blockNumber;
          }

          if (kind === CompletionItemKind.Reference && Registers.findIndex(r => r === operandToken.name.toLocaleLowerCase()) < 0) {
            this.references.push({
              name: operandToken.name,
              range: refRange,
              token: token,
            } as SymbolReference);
          }

          this.tokens.push(token);
        });        
      }
      return [pos, labelToken, opCodeToken];
    }
    return last;
  }

  private fillComment(text: string, last: [number, AssemblyToken, AssemblyToken] = [0, null, null]): [number, AssemblyToken, AssemblyToken] {
    if (text && text.length > 0) {
      let [pos, labelToken] = last;
      text = text.trim();
      const start = this.rawLine.indexOf(text, pos);
      pos = start + text.length;
      const range = this.getRange(start, pos);

      // Populate variables
      this.comment = text;

      // Create and add token
      this.tokens.push(new AssemblyToken(text, range, this.lineRange, CompletionItemKind.Text, 'comment'));
      if (labelToken) {
        labelToken.documentation = text;
      }
    }
    return last;
  }



  private getTokensFromExpression(expression: string): FoundToken[] {
    const tokens: FoundToken[] = [];
    const findMatch = (s: string): [RegExpMatchArray, string] => {
      let match = s.match(/^[._a-z][a-z0-9.$_@?]*/i); // symbol
      const tokenType = match ? 'variable' : 'number';
      if (!match) {
        match = s.match(/^('.)|("..)/); // character constant
      }
      if (!match) {
        match = s.match(/^((\$|(0x))[0-9a-f]*)|([0-9][0-9a-f]*h)/i); // hex number
      }
      if (!match) {
        match = s.match(/^(@[0-7]+)|([0-7]+[qo])/i); // octal number
      }
      if (!match) {
        match = s.match(/^(%[01]+)|([01]+b)/i); // binary number
      }
      if (!match) {
        match = s.match(/^[0-9]+&?/i); // decimal number
      }
      return [match, tokenType];
    };

    let pos = 0;
    while (expression.length > 0) {
      const match = findMatch(expression);
      if (match[0]) {
        tokens.push({ type: match[1], name: match[0][0].toString(), start: pos } as FoundToken);
        expression = expression.substring(match[0][0].length);
        pos += match[0][0].length;
      } else {
        tokens.push({ type: 'operator', name: expression[0], start: pos } as FoundToken);
        expression = expression.substr(1);
        pos += 1;
      }
    }
    return tokens;
  }
}
