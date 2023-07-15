import { delimitedStringPseudoOps, filePseudoOps, inherentOpcodes, inherentPseudoOps, operandOpcodes, pragmaPseudoOps, pseudoOps, Registers, stringPseudoOps, Token, TokenKind, TokenModifier, TokenType } from '../common';

interface FoundInfo { 
  match: RegExpMatchArray;
  kind: TokenKind;
  type: TokenType;
  modifiers: TokenModifier;
  isLocal: boolean;
}

export class LineParser {

  public static parse(line: string, labelOnly = false): Token[] {

    // Empty line
    if (line.trim() === '') {
      return [];
    }

    const tokens: Token[] = [];
    let pos = 0;
    let text = line;

    // Line number
    const lineNumberMatch = /^([0-9]+)([ ]|$)/.exec(text);
    if (lineNumberMatch) {
      tokens.push(new Token(lineNumberMatch[1], pos, lineNumberMatch[1].length, TokenKind.ignore, TokenType.label));
      
      pos += lineNumberMatch[0].length;
      text = line.substring(pos);
      if (!text) {
        return tokens; // end of the line, return
      }
    }

    // Line with only comment
    let commentMatch = /^(?:(\s*)[*;#])\s*(.*)/.exec(text);
    if (commentMatch) {
      const space = commentMatch[1].length;
      tokens.push(new Token(commentMatch[2].trimEnd(), pos + space, commentMatch[0].trim().length, TokenKind.comment, TokenType.comment));
      return tokens;
    }

    // Line starting with a symbol
    const symbolMatch = /^([^\s:]+)/.exec(text); // match everything until a space or colon
    if (symbolMatch) {
      const name = symbolMatch[1];
      const isValid = /^([a-z_@$][a-z0-9.$_@?]+)$/i.test(name);
      const isLocal = /.*[$@?].*/.test(name);
      tokens.push(new Token(name, pos, name.length, TokenKind.label, isLocal ? TokenType.function : TokenType.class, isValid, isLocal));

      pos += symbolMatch[0].length;
      text = line.substring(pos);
      if (!text) {
        return tokens; // end of the line, return
      }
    }

    // Leave early if looking for only labels
    if (labelOnly) {
      return tokens;
    }

    // Symbol can be followed bt a colon (acts like a space)
    const colonFound = text.startsWith(':');
    if (colonFound) {
      if (!symbolMatch) {
        // A colon preceeded by nothing is an empty symbol (invalid)
        tokens.push(new Token('', pos, 0, TokenKind.label, TokenType.class, false));
      }
      tokens.push(new Token(':', pos, 1, TokenKind.ignore, TokenType.operator));

      text = ' ' + line.substring(pos + 1); // replace the colon with a space for next match
      if (text === ' ') {
        return tokens; // end of the line, return
      }
    }

    // Followed by a comment
    commentMatch = /^(?:(\s+)[*;])(.*)/.exec(text);
    if (commentMatch) {
      const space = commentMatch[1].length;
      tokens.push(new Token(commentMatch[2].trim(), space + pos, commentMatch[0].trim().length, TokenKind.comment, TokenType.comment));
      return tokens;
    }

    // Opcode, Pseudo-op, macro or struct
    let opcode = '';
    const opcodeMatch = /^(\s+)([^\s]+)/.exec(text); // match everything until a space
    if (opcodeMatch) {
      const space = opcodeMatch[1].length;
      opcode = opcodeMatch[2].toLowerCase();
      const isOpcode = inherentOpcodes.has(opcode) || operandOpcodes.has(opcode) || inherentPseudoOps.has(opcode) || pseudoOps.has(opcode);
      tokens.push(new Token(opcode, pos + space, opcode.length, 
        isOpcode ? TokenKind.opCode : TokenKind.macroOrStruct, 
        isOpcode ? TokenType.keyword : TokenType.type));

      pos += opcodeMatch[0].length;
      text = line.substring(pos);
      if (!text) {
        return tokens; // end of the line, return
      }

      // if delimited string operand, match and consume
      if (delimitedStringPseudoOps.has(opcode)) {
        const operandMatch = /^(\s+)((.).*\2)/.exec(text); // match everything until a space
        if (operandMatch) {
          const space = operandMatch[1].length;
          const str = operandMatch[2];
          tokens.push(new Token(str, pos + space, str.length, TokenKind.operand, TokenType.string));
    
          pos += operandMatch[0].length;
          text = line.substring(pos);
          if (!text) {
            return tokens; // end of the line, return
          }
        }
      }
      // if file operand, match and consume
      else if (pragmaPseudoOps.has(opcode)) {
        const operandMatch = /^(\s+)([^\s]+)/.exec(text); // match everything until a space
        if (operandMatch) {
          const space = operandMatch[1].length;
          const pragmas = operandMatch[2].split(',');
          let offset = 0;
          pragmas.forEach((pragma, index, array) => {
            tokens.push(new Token(pragma, pos + space + offset, pragma.length, TokenKind.ignore, TokenType.parameter));
            if (index < array.length - 1) {
              tokens.push(new Token(',', pos + space + offset + pragma.length, 1, TokenKind.ignore, TokenType.operator));
            }
            offset += pragma.length + 1;
          });
    
          pos += operandMatch[0].length;
          text = line.substring(pos);
          if (!text) {
            return tokens; // end of the line, return
          }
        }
      }
      // if file operand, match and consume
      else if (filePseudoOps.has(opcode)) {
        const operandMatch = /^(\s+)(.*)/.exec(text); // match everything until a space
        if (operandMatch) {
          const space = operandMatch[1].length;
          const str = operandMatch[2];
          tokens.push(new Token(str, pos + space, str.length, TokenKind.file, TokenType.string));
    
          pos += operandMatch[0].length;
          text = line.substring(pos);
          if (!text) {
            return tokens; // end of the line, return
          }
        }
      }
      // if string operand, match and consume
      else if (stringPseudoOps.has(opcode)) {
        const operandMatch = /^(\s+)(.*)/.exec(text); // match everything until a space
        if (operandMatch) {
          const space = operandMatch[1].length;
          const str = operandMatch[2];
          tokens.push(new Token(str, pos + space, str.length, TokenKind.operand, TokenType.string));
    
          pos += operandMatch[0].length;
          text = line.substring(pos);
          if (!text) {
            return tokens; // end of the line, return
          }
        }
      }
      // if opcode needs operand, match and consume
      else if (operandOpcodes.has(opcode)) {
        const operandMatch = /^(\s+)([^\s]+)/.exec(text); // match everything until a space
        if (operandMatch) {
          const space = operandMatch[1].length;
          let expression = operandMatch[2];
          tokens.push(new Token(expression, pos + space, expression.length, TokenKind.operand, TokenType.namespace));

          let offset = 0;
          let isProperty = false;
          while (expression.length > 0) {
            const found = this.findMatch(expression, isProperty);
            const length = found.match[0].length;
            
            const token = new Token(found.match[0], pos + space + offset, length, found.kind, found.type);
            token.modifiers = found.modifiers;
            token.isLocal = found.isLocal;
            tokens.push(token);
            isProperty = token.type === TokenType.operator && token.text === '.';

            expression = expression.substring(length);
            offset += length;
          }

          pos += operandMatch[0].length;
          text = line.substring(pos);
          if (!text) {
            return tokens; // end of the line, return
          }
        }
      }
    }

    // End of line comment
    commentMatch = /^(?:(\s+)[*;]?)(.*)/.exec(text); // 
    if (commentMatch && commentMatch[2]) {
      const space = commentMatch[1].length;
      tokens.push(new Token(commentMatch[2].trim(), space + pos, commentMatch[0].trim().length, TokenKind.comment, TokenType.comment));
      return tokens;
    }

    return tokens;
  }

  private static findMatch(s: string, isProperty: boolean): FoundInfo {
    let tokenKind = TokenKind.ignore;
    let tokenType = TokenType.number;
    let tokenModifiers = 0;
    let isLocal = false;

    let match = /^(('.)|("..))/.exec(s); // character constant
    if (!match) {
      match = /^((\$|(0x))[0-9a-f]*)|([0-9][0-9a-f]*h)/i.exec(s); // hex number
    }
    if (!match) {
      match = /^((@[0-7]+)|([0-7]+[qo]))/i.exec(s); // octal number
    }
    if (!match) {
      match = /^((%[01]+)|([01]+b))/i.exec(s); // binary number
    }
    if (!match) {
      match = /^((&[0-9]+)|([0-9]+))/i.exec(s); // decimal number
    }
    if (!match) {
      match = /^([a-z_@$][a-z0-9$_@?]*)/i.exec(s); // reference
      if (match) {
        isLocal = /.*[$@?].*/.test(s);
        
        if (isProperty) {
          tokenKind = TokenKind.property;
          tokenType = TokenType.property;
        } else if (Registers.has(match[0].toLowerCase())) {
          tokenType = TokenType.variable;
          tokenModifiers = TokenModifier.static;
        } else {
          tokenKind = TokenKind.reference;
          tokenType = TokenType.variable;
        }
      }
    }
    if (!match) {
      tokenType = TokenType.operator;
      match = /^((&&)|(\|\|)|(\+\+)|(--))/.exec(s); // two character operator
      if (!match) {
        match = /./.exec(s); // if all else fails, match the next character as an operator.
      }
    }
    
    return { match: match, kind: tokenKind, type: tokenType, modifiers: tokenModifiers, isLocal: isLocal };
  }
}