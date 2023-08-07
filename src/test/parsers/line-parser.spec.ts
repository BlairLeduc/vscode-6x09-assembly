import { Token, TokenKind, TokenModifier, TokenType } from '../../constants';
import { LineParser } from '../../parsers/line-parser';

describe('LineParser', () => {
  it('Empty string returns empty token list', () => {
    const line = '';
    const tokens = LineParser.parse(line);

    expect(tokens).toBeTruthy();
    expect(tokens.length).toBe(0);
  });

  it('String with whitespace returns empty token list', () => {
    const line = '\t   \n\n   ';
    const tokens = LineParser.parse(line);

    expect(tokens).toBeTruthy();
    expect(tokens.length).toBe(0);
  });

  it('Line with only line number returns empty token list', () => {
    const line = '00010';
    const expectedToken = new Token(line, 0, line.length, TokenKind.ignore, TokenType.label);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with only global symbol returns global symbol token', () => {
    const expectedSymbol = 'GlobalSymbol';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with line number, global symbol returns global symbol token', () => {
    const expectedLineNumber = '12345';
    const expectedSymbol = 'GlobalSymbol';
    const line = `${expectedLineNumber} ${expectedSymbol}`;
    const expectedLineNumberToken = new Token(
      expectedLineNumber,
      line.indexOf(expectedLineNumber),
      expectedLineNumber.length,
      TokenKind.ignore,
      TokenType.label);
    const expectedToken = new Token(
      expectedSymbol,
      line.indexOf(expectedSymbol),
      expectedSymbol.length,
      TokenKind.label,
      TokenType.class);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedLineNumberToken);
    expect(tokens[1]).toEqual(expectedToken);
  });

  it('Line with only local Symbol Local@Symbol returns single local symbol token', () => {
    const expectedSymbol = 'Local@Symbol';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with only local Symbol LocalSymbol? returns single local symbol token', () => {
    const expectedSymbol = 'LocalSymbol?';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with only local Symbol LocalSymbol returns single local symbol token', () => {
    const expectedSymbol = '$LocalSymbol';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });


  it('Line with only local Symbol _?$@. returns single local symbol token', () => {
    const expectedSymbol = '_?$@.';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with global symbol followed by whitespace returns single global symbol token', () => {
    const expectedSymbol = 'GlobalSymbol';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with local symbol Local?Symbol followed by whitespace returns single local symbol token', () => {
    const expectedSymbol = 'Local?Symbol';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with invalid local symbol ?LocalSymbol followed by whitespace returns invalid local symbol token', () => {
    const expectedSymbol = '?LocalSymbol';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, false, true);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with invalid local symbol .LocalSymbol followed by whitespace returns invalid local symbol token', () => {
    const expectedSymbol = '.LocalSymbol';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class, false);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with invalid global symbol followed by whitespace returns invalid global symbol token', () => {
    const expectedSymbol = 'foo-bar';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class, false);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with invalid global symbol (*) followed by whitespace returns invalid global symbol token', () => {
    const expectedSymbol = 'foo*bar';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class, false);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedToken);
  });

  it('Line with invalid global symbol starting with a colon followed by whitespace returns invalid global symbol token', () => {
    const expectedSymbol = ':';
    const line = `${expectedSymbol}\t`;
    const expectedSymbolToken = new Token('', 0, 0, TokenKind.label, TokenType.class, false);
    const expectedColonToken = new Token(':', 0, 1, TokenKind.ignore, TokenType.operator);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedSymbolToken);
    expect(tokens[1]).toEqual(expectedColonToken);
  });

  it('Line with global symbol followed by colon returns a global symbol and operator token', () => {
    const expectedSymbol = 'GlobalSymbol';
    const line = `${expectedSymbol}:`;
    const expectedSymbolToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class);
    const expectedColonToken = new Token(':', expectedSymbol.length, 1, TokenKind.ignore, TokenType.operator);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedSymbolToken);
    expect(tokens[1]).toEqual(expectedColonToken);
  });

  it('Line with invalid local symbol followed by colon returns invalid local symbol and operator token', () => {
    const expectedSymbol = 'foo-bar@';
    const line = `${expectedSymbol}:`;
    const expectedSymbolToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, false, true);
    const expectedColonToken = new Token(':', expectedSymbol.length, 1, TokenKind.ignore, TokenType.operator);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedSymbolToken);
    expect(tokens[1]).toEqual(expectedColonToken);
  });

  it('* Comment at start of the line returns comment token', () => {
    const expectedComment = 'Hello there';
    const commentString = `*${expectedComment}`;
    const line = commentString;
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedCommentToken);
  });

  it('Line number followed by * Comment returns comment token', () => {
    const expectedLineNumber = '42';
    const expectedComment = 'Hello there';
    const commentString = `*${expectedComment}`;
    const line = `${expectedLineNumber} ${commentString}`;
    const expectedLineNumberToken = new Token(
      expectedLineNumber,
      line.indexOf(expectedLineNumber),
      expectedLineNumber.length,
      TokenKind.ignore,
      TokenType.label);
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedLineNumberToken);
    expect(tokens[1]).toEqual(expectedCommentToken);
  });

  it('* Comment at start of the line followed by whitespace returns comment token', () => {
    const expectedComment = 'Hello Bob!';
    const commentString = `* ${expectedComment}`;
    const line = `${commentString}\t   `;
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedCommentToken);
  });

  it('; Comment at start of the line returns comment token', () => {
    const expectedComment = 'This is a comment';
    const commentString = `; ${expectedComment}`;
    const line = commentString;
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedCommentToken);
  });

  it('; Comment at start of the line followed by whitespace returns comment token', () => {
    const expectedComment = 'Loop around the world';
    const commentString = `;${expectedComment}`;
    const line = `${commentString}\t   `;
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedCommentToken);
  });

  it('* Only comment in the line returns comment token', () => {
    const expectedComment = 'Hello';
    const commentString = `* ${expectedComment}`;
    const line = `\t${commentString}`;
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedCommentToken);
  });

  it('* Only comment in the line followed by whitespace returns comment token', () => {
    const expectedComment = 'Bob\'s your uncle';
    const commentString = `*${expectedComment}`;
    const line = `           ${commentString}\t   `;
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedCommentToken);
  });

  it('; Only comment in the line returns comment token', () => {
    const expectedComment = 'Hello';
    const commentString = `; ${expectedComment}`;
    const line = `\t     ${commentString}`;
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedCommentToken);
  });

  it('; Only comment in the line followed by whitespace returns comment token', () => {
    const expectedComment = ';;;;;;;;;;;;;;;;;;;;;;;';
    const commentString = `;${expectedComment}`;
    const line = `\t\t${commentString}\t   `;
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(1);
    expect(tokens[0]).toEqual(expectedCommentToken);
  });

  it('Global Symbol followed by comment returns global symbol and comment token', () => {
    const expectedSymbol = 'GlobalSymbol';
    const expectedComment = 'Egad, a comment';
    const commentString = `*${expectedComment}`;
    const line = `${expectedSymbol} ${commentString}`;
    const expectedSymbolToken = new Token(
      expectedSymbol,
      line.indexOf(expectedSymbol),
      expectedSymbol.length,
      TokenKind.label,
      TokenType.class);
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedSymbolToken);
    expect(tokens[1]).toEqual(expectedCommentToken);
  });

  it('Local Symbol, colon, comment returns local symbol, colon, comment tokens', () => {
    const expectedSymbol = 'Local@Symbol';
    const expectedComment = '372hf7bv7 62736v-=][;/,';
    const commentString = `; ${expectedComment}`;
    const line = `${expectedSymbol}:${commentString}`;
    const expectedSymbolToken = new Token(
      expectedSymbol,
      line.indexOf(expectedSymbol),
      expectedSymbol.length,
      TokenKind.label, TokenType.function, true, true);
    const expectedColonToken = new Token(
      ':',
      line.indexOf(':'),
      1,
      TokenKind.ignore, TokenType.operator);
    const expectedCommentToken = new Token(
      expectedComment,
      line.indexOf(commentString),
      commentString.length,
      TokenKind.comment,
      TokenType.comment);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(3);
    expect(tokens[0]).toEqual(expectedSymbolToken);
    expect(tokens[1]).toEqual(expectedColonToken);
    expect(tokens[2]).toEqual(expectedCommentToken);
  });

  ['abx', 'struct'].forEach(opcode => {

    it(`Inherent opcode ${opcode} returns opcode token`, () => {
      const expectedOpcode = opcode;
      const line = ` ${expectedOpcode}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(1);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
    });

    it(`Inherent opcode ${opcode.toUpperCase()} returns opcode (in lowercase) token`, () => {
      const expectedOpcode = opcode;
      const line = ` ${expectedOpcode.toUpperCase()}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode.toUpperCase()),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(1);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
    });

    it(`Inherent opcode ${opcode}, comment returns opcode, comment tokens`, () => {
      const expectedOpcode = opcode;
      const expectedComment = 'Hello there';
      const commentString = `${expectedComment}`;
      const line = ` ${expectedOpcode} ${commentString}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedCommentToken = new Token(
        expectedComment,
        line.indexOf(commentString),
        commentString.length,
        TokenKind.comment,
        TokenType.comment);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(2);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedCommentToken);
    });

    it(`Symbol, inherent opcode ${opcode}, comment returns symbol, opcode, comment tokens`, () => {
      const expectedSymbol = 'GlobalSymbol';
      const expectedOpcode = opcode;
      const expectedComment = 'Hello there';
      const commentString = `${expectedComment}`;
      const line = `${expectedSymbol} ${expectedOpcode} ${commentString}`;
      const expectedSymbolToken = new Token(
        expectedSymbol,
        line.indexOf(expectedSymbol),
        expectedSymbol.length,
        TokenKind.label,
        TokenType.class);
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedCommentToken = new Token(
        expectedComment,
        line.indexOf(commentString),
        commentString.length,
        TokenKind.comment,
        TokenType.comment);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedSymbolToken);
      expect(tokens[1]).toEqual(expectedOpcodeToken);
      expect(tokens[2]).toEqual(expectedCommentToken);
    });

    it(`Inherent opcode ${opcode}, * comment returns inherent opcode, comment tokens`, () => {
      const expectedOpcode = opcode;
      const expectedComment = 'Hello there';
      const commentString = `* ${expectedComment}`;

      const line = ` ${expectedOpcode} ${commentString}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedCommentToken = new Token(
        expectedComment,
        line.indexOf(commentString),
        commentString.length,
        TokenKind.comment,
        TokenType.comment);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(2);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedCommentToken);
    });

    it(`Symbol, inherent opcode ${opcode}, comment returns symbol, opcode, comment tokens`, () => {
      const expectedSymbol = 'GlobalSymbol';
      const expectedOpcode = opcode;
      const expectedComment = 'Hello there';
      const commentString = `;${expectedComment}`;
      const line = `${expectedSymbol}:${expectedOpcode} ${commentString}`;
      const expectedSymbolToken = new Token(
        expectedSymbol,
        line.indexOf(expectedSymbol),
        expectedSymbol.length,
        TokenKind.label,
        TokenType.class);
      const expectedColonToken = new Token(
        ':',
        line.indexOf(':'),
        1,
        TokenKind.ignore,
        TokenType.operator);
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedCommentToken = new Token(
        expectedComment,
        line.indexOf(commentString),
        commentString.length,
        TokenKind.comment,
        TokenType.comment);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(4);
      expect(tokens[0]).toEqual(expectedSymbolToken);
      expect(tokens[1]).toEqual(expectedColonToken);
      expect(tokens[2]).toEqual(expectedOpcodeToken);
      expect(tokens[3]).toEqual(expectedCommentToken);
    });
  });

  ['clr'].forEach(opcode => {

    it(`Operand opcode ${opcode}, operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '42';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Operand opcode ${opcode.toUpperCase()}, operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '42';
      const line = ` ${expectedOpcode.toUpperCase()} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode.toUpperCase()),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Operand opcode ${opcode}, comment returns opcode, operand, comment tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '42';
      const expectedComment = 'Hello there';
      const commentString = `${expectedComment}`;
      const line = ` ${expectedOpcode} ${expectedOperand} ${commentString}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);
      const expectedCommentToken = new Token(
        expectedComment,
        line.indexOf(commentString),
        commentString.length,
        TokenKind.comment,
        TokenType.comment);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(4);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
      expect(tokens[3]).toEqual(expectedCommentToken);
    });

    it(`Symbol, operand opcode ${opcode}, comment returns symbol, opcode, operand, comment tokens`, () => {
      const expectedSymbol = 'GlobalSymbol';
      const expectedOpcode = opcode;
      const expectedOperand = '42';
      const expectedComment = 'Hello there';
      const commentString = `${expectedComment}`;
      const line = `${expectedSymbol} ${expectedOpcode} ${expectedOperand} ${commentString}`;
      const expectedSymbolToken = new Token(
        expectedSymbol,
        line.indexOf(expectedSymbol),
        expectedSymbol.length,
        TokenKind.label,
        TokenType.class);
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);
      const expectedCommentToken = new Token(
        expectedComment,
        line.indexOf(commentString),
        commentString.length,
        TokenKind.comment,
        TokenType.comment);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(5);
      expect(tokens[0]).toEqual(expectedSymbolToken);
      expect(tokens[1]).toEqual(expectedOpcodeToken);
      expect(tokens[2]).toEqual(expectedAllOperandToken);
      expect(tokens[3]).toEqual(expectedOperandToken);
      expect(tokens[4]).toEqual(expectedCommentToken);
    });

    it(`Binary % operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '%11001010';
      const line = `  ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Binary b operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '10101100b';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Octal @ operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '@755';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Octal o operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '755o';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Octal q operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '755q';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Hexidecimal $ operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '$7F80';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Hexidecimal 0x operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '0x7F80';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Hexidecimal H operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '7F80H';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Hexidecimal start 0 end H operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '0FFH';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Decimal operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '42';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Decimal & operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '&42';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Symbol * operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '*';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.operator);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Character ' operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = "'A";
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Character " operand returns opcode, operand tokens`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '"AB';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Immediate operand returns opcode, Operator, numeric token`, () => {
      const expectedOpcode = opcode;
      const immediate = '#';
      const number = '42';
      const expectedOperand = `${immediate}${number}`;
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedImmediateToken = new Token(
        immediate,
        line.indexOf(immediate),
        immediate.length,
        TokenKind.ignore,
        TokenType.operator);
      const expectedNumberToken = new Token(
        number,
        line.indexOf(number),
        number.length,
        TokenKind.ignore,
        TokenType.number);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(4);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedImmediateToken);
      expect(tokens[3]).toEqual(expectedNumberToken);
    });

    it(`Immediate reference operand returns opcode, Operator, numeric token`, () => {
      const expectedOpcode = opcode;
      const immediate = '#';
      const reference = 'hello';
      const expectedOperand = `${immediate}${reference}`;
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedImmediateToken = new Token(
        immediate,
        line.indexOf(immediate),
        immediate.length,
        TokenKind.ignore,
        TokenType.operator);
      const expectedReferenceToken = new Token(
        reference,
        line.indexOf(reference),
        reference.length,
        TokenKind.reference,
        TokenType.variable);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(4);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedImmediateToken);
      expect(tokens[3]).toEqual(expectedReferenceToken);
    });

    it(`Immediate register inc operand returns opcode, Operator, numeric token`, () => {
      const expectedOpcode = opcode;
      const comma = ',';
      const register = 'x';
      const increment = '++';
      const expectedOperand = `${comma}${register}${increment}`;
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedCommaToken = new Token(
        comma,
        line.indexOf(comma),
        comma.length,
        TokenKind.ignore,
        TokenType.operator);
      const expectedRegisterToken = new Token(
        register,
        line.indexOf(register),
        register.length,
        TokenKind.ignore,
        TokenType.variable);
      expectedRegisterToken.modifiers = TokenModifier.static;
      const expectedIncrementToken = new Token(
        increment,
        line.indexOf(increment),
        increment.length,
        TokenKind.ignore,
        TokenType.operator);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(5);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedCommaToken);
      expect(tokens[3]).toEqual(expectedRegisterToken);
      expect(tokens[4]).toEqual(expectedIncrementToken);
    });

    it(`&& operator operand returns opcode, Operator token`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '&&';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.operator);


      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });

    it(`Bad operator operand returns opcode, Operator token`, () => {
      const expectedOpcode = opcode;
      const expectedOperand = '}';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedAllOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.namespace);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.ignore,
        TokenType.operator);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(3);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedAllOperandToken);
      expect(tokens[2]).toEqual(expectedOperandToken);
    });
  });

  ['fcc', 'fcn', 'fcs'].forEach(pseudo => {
    it(`${pseudo} string, operand returns opcode, string tokens`, () => {
      const expectedOpcode = pseudo;
      const expectedOperand = '/this is a string/';
      const line = ` ${expectedOpcode} ${expectedOperand}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);
      const expectedOperandToken = new Token(
        expectedOperand,
        line.indexOf(expectedOperand),
        expectedOperand.length,
        TokenKind.operand,
        TokenType.string);

      const tokens = LineParser.parse(line);

      expect(tokens.length).toBe(2);
      expect(tokens[0]).toEqual(expectedOpcodeToken);
      expect(tokens[1]).toEqual(expectedOperandToken);
    });
  });

  it('pramga string, returns opcode, single pragma', () => {
    const expectedOpcode = 'pragma';
    const expectedOperand = 'this';
    const line = ` ${expectedOpcode} ${expectedOperand}`;
    const expectedOpcodeToken = new Token(
      expectedOpcode,
      line.indexOf(expectedOpcode),
      expectedOpcode.length,
      TokenKind.opCode,
      TokenType.keyword);
    const expectedOperandToken = new Token(
      expectedOperand,
      line.indexOf(expectedOperand),
      expectedOperand.length,
      TokenKind.ignore,
      TokenType.parameter);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedOpcodeToken);
    expect(tokens[1]).toEqual(expectedOperandToken);
  });

  it('pramga string, returns opcode, multiple pragmas', () => {
    const expectedOpcode = 'pragma';
    const expectedFirstPragma = 'this';
    const expectedSecondPragma = 'that';
    const line = ` ${expectedOpcode} ${expectedFirstPragma},${expectedSecondPragma}`;
    const expectedOpcodeToken = new Token(
      expectedOpcode,
      line.indexOf(expectedOpcode),
      expectedOpcode.length,
      TokenKind.opCode,
      TokenType.keyword);
    const expectedFirstPragmaToken = new Token(
      expectedFirstPragma,
      line.indexOf(expectedFirstPragma),
      expectedFirstPragma.length,
      TokenKind.ignore,
      TokenType.parameter);
    const expectedColonToken = new Token(
      ',',
      line.indexOf(','),
      1,
      TokenKind.ignore, TokenType.operator);
    const expectedSecondPragmaToken = new Token(
      expectedSecondPragma,
      line.indexOf(expectedSecondPragma),
      expectedSecondPragma.length,
      TokenKind.ignore,
      TokenType.parameter);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(4);
    expect(tokens[0]).toEqual(expectedOpcodeToken);
    expect(tokens[1]).toEqual(expectedFirstPragmaToken);
    expect(tokens[2]).toEqual(expectedColonToken);
    expect(tokens[3]).toEqual(expectedSecondPragmaToken);
  });
  // sta	rightJoystick.button

  it('opcode struct.property, returns opcode, struct, dot, porperty', () => {
    const expectedOpcode = 'sta';
    const expectedStruct = 'this';
    const expectedProperty = 'that';
    const expectedVariable = `${expectedStruct}.${expectedProperty}`;
    const line = ` ${expectedOpcode} ${expectedVariable}`;
    const expectedOpcodeToken = new Token(
      expectedOpcode,
      line.indexOf(expectedOpcode),
      expectedOpcode.length,
      TokenKind.opCode,
      TokenType.keyword);
    const expectedVariableToken = new Token(
      expectedVariable,
      line.indexOf(expectedVariable),
      expectedVariable.length,
      TokenKind.operand,
      TokenType.namespace);
    const expectedStructToken = new Token(
      expectedStruct,
      line.indexOf(expectedStruct),
      expectedStruct.length,
      TokenKind.reference,
      TokenType.variable);
    const expectedDotToken = new Token(
      '.',
      line.indexOf('.'),
      1,
      TokenKind.ignore, TokenType.operator);
    const expectedPropertyToken = new Token(
      expectedProperty,
      line.indexOf(expectedProperty),
      expectedProperty.length,
      TokenKind.property,
      TokenType.property);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(5);
    expect(tokens[0]).toEqual(expectedOpcodeToken);
    expect(tokens[1]).toEqual(expectedVariableToken);
    expect(tokens[2]).toEqual(expectedStructToken);
    expect(tokens[3]).toEqual(expectedDotToken);
    expect(tokens[4]).toEqual(expectedPropertyToken);
  });

  it(`include string, operand returns opcode, string tokens`, () => {
    const expectedOpcode = 'include';
    const expectedOperand = '/usr/local/var/file.asm';
    const line = ` ${expectedOpcode} ${expectedOperand}`;
    const expectedOpcodeToken = new Token(
      expectedOpcode,
      line.indexOf(expectedOpcode),
      expectedOpcode.length,
      TokenKind.opCode,
      TokenType.keyword);
    const expectedOperandToken = new Token(
      expectedOperand,
      line.indexOf(expectedOperand),
      expectedOperand.length,
      TokenKind.file,
      TokenType.string);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedOpcodeToken);
    expect(tokens[1]).toEqual(expectedOperandToken);
  });

  it(`warning string, operand returns opcode, string tokens`, () => {
    const expectedOpcode = 'warning';
    const expectedOperand = 'Watch your head!';
    const line = ` ${expectedOpcode} ${expectedOperand}`;
    const expectedOpcodeToken = new Token(
      expectedOpcode,
      line.indexOf(expectedOpcode),
      expectedOpcode.length,
      TokenKind.opCode,
      TokenType.keyword);
    const expectedOperandToken = new Token(
      expectedOperand,
      line.indexOf(expectedOperand),
      expectedOperand.length,
      TokenKind.operand,
      TokenType.string);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedOpcodeToken);
    expect(tokens[1]).toEqual(expectedOperandToken);
  });

  it('unknown opcode should be a macro or struct', () => {
    const expectedLabel = 'label';
    const expectedOpcode = 'unknown';
    const line = `${expectedLabel} ${expectedOpcode}`;
    const expectedLabelToken = new Token(
      expectedLabel,
      line.indexOf(expectedLabel),
      expectedLabel.length,
      TokenKind.label,
      TokenType.class);
    const expectedOpcodeToken = new Token(
      expectedOpcode,
      line.indexOf(expectedOpcode),
      expectedOpcode.length,
      TokenKind.opCode,
      TokenType.keyword);

    const tokens = LineParser.parse(line);

    expect(tokens.length).toBe(2);
    expect(tokens[0]).toEqual(expectedLabelToken);
    expect(tokens[1]).toEqual(expectedOpcodeToken);
  });
});
