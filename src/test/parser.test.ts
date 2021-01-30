//
// Note: This test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// Classes under test

import { Token, TokenKind, TokenModifier, TokenType } from '../common';
import { LineParser } from '../parsers/line-parser';

suite('LineParser', () => {
  test('Empty string returns empty token list', () => {
    const line = '';
    const tokens = LineParser.parse(line);

    assert.ok(tokens);
    assert.strictEqual(tokens.length, 0);
  });

  test('String with whitespace returns empty token list', () => {
    const line = '\t   \n\n   ';
    const tokens = LineParser.parse(line);

    assert.ok(tokens);
    assert.strictEqual(tokens.length, 0);
  });

  test('Line with only line number returns empty token list', () => {
    const line = '00010';
    const expectedToken = new Token(line, 0, line.length, TokenKind.ignore, TokenType.label);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with only global symbol returns global symbol token', () => {
    const expectedSymbol = 'GlobalSymbol';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with line number, global symbol returns global symbol token', () => {
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

    assert.strictEqual(tokens.length, 2);
    assert.deepStrictEqual(tokens[0], expectedLineNumberToken);
    assert.deepStrictEqual(tokens[1], expectedToken);
  });

  test('Line with only local Symbol Local@Symbol returns single local symbol token', () => {
    const expectedSymbol = 'Local@Symbol';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with only local Symbol LocalSymbol? returns single local symbol token', () => {
    const expectedSymbol = 'LocalSymbol?';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with only local Symbol LocalSymbol returns single local symbol token', () => {
    const expectedSymbol = '$LocalSymbol';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });


  test('Line with only local Symbol _?$@. returns single local symbol token', () => {
    const expectedSymbol = '_?$@.';
    const line = `${expectedSymbol}`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with global symbol followed by whitespace returns single global symbol token', () => {
    const expectedSymbol = 'GlobalSymbol';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with local symbol Local?Symbol followed by whitespace returns single local symbol token', () => {
    const expectedSymbol = 'Local?Symbol';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, true, true);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with invalid local symbol ?LocalSymbol followed by whitespace returns invalid local symbol token', () => {
    const expectedSymbol = '?LocalSymbol';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, false, true);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with invalid local symbol .LocalSymbol followed by whitespace returns invalid local symbol token', () => {
    const expectedSymbol = '.LocalSymbol';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class, false);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with invalid global symbol followed by whitespace returns invalid global symbol token', () => {
    const expectedSymbol = 'foo-bar';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class, false);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with invalid global symbol (*) followed by whitespace returns invalid global symbol token', () => {
    const expectedSymbol = 'foo*bar';
    const line = `${expectedSymbol}\t`;
    const expectedToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class, false);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0], expectedToken);
  });

  test('Line with invalid global symbol starting with a colon followed by whitespace returns invalid global symbol token', () => {
    const expectedSymbol = ':';
    const line = `${expectedSymbol}\t`;
    const expectedSymbolToken = new Token('', 0, 0, TokenKind.label, TokenType.class, false);
    const expectedColonToken = new Token(':', 0, 1, TokenKind.ignore, TokenType.operator);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 2);
    assert.deepStrictEqual(tokens[0], expectedSymbolToken);
    assert.deepStrictEqual(tokens[1], expectedColonToken);
  });

  test('Line with global symbol followed by colon returns a global symbol and operator token', () => {
    const expectedSymbol = 'GlobalSymbol';
    const line = `${expectedSymbol}:`;
    const expectedSymbolToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.class);
    const expectedColonToken = new Token(':', expectedSymbol.length, 1, TokenKind.ignore, TokenType.operator);

    const tokens = LineParser.parse(line);
    
    assert.strictEqual(tokens.length, 2);
    assert.deepStrictEqual(tokens[0], expectedSymbolToken);
    assert.deepStrictEqual(tokens[1], expectedColonToken);
  });

  test('Line with invalid local symbol followed by colon returns invalid local symbol and operator token', () => {
    const expectedSymbol = 'foo-bar@';
    const line = `${expectedSymbol}:`;
    const expectedSymbolToken = new Token(expectedSymbol, 0, expectedSymbol.length, TokenKind.label, TokenType.function, false, true);
    const expectedColonToken = new Token(':', expectedSymbol.length, 1, TokenKind.ignore, TokenType.operator);

    const tokens = LineParser.parse(line);

    assert.strictEqual(tokens.length, 2);
    assert.deepStrictEqual(tokens[0], expectedSymbolToken);
    assert.deepStrictEqual(tokens[1], expectedColonToken);
  });

  test('* Comment at start of the line returns comment token', () => {
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

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0],expectedCommentToken);
  });

  test('Line number followed by * Comment returns comment token', () => {
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

    assert.strictEqual(tokens.length, 2);
    assert.deepStrictEqual(tokens[0],expectedLineNumberToken);
    assert.deepStrictEqual(tokens[1],expectedCommentToken);
  });

  test('* Comment at start of the line followed by whitespace returns comment token', () => {
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

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0],expectedCommentToken);
  });

  test('; Comment at start of the line returns comment token', () => {
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

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0],expectedCommentToken);
  });

  test('; Comment at start of the line followed by whitespace returns comment token', () => {
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

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0],expectedCommentToken);
  });

  test('* Only comment in the line returns comment token', () => {
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

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0],expectedCommentToken);
  });

  test('* Only comment in the line followed by whitespace returns comment token', () => {
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

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0],expectedCommentToken);
  });

  test('; Only comment in the line returns comment token', () => {
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

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0],expectedCommentToken);
  });

  test('; Only comment in the line followed by whitespace returns comment token', () => {
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

    assert.strictEqual(tokens.length, 1);
    assert.deepStrictEqual(tokens[0],expectedCommentToken);
  });

  test('Global Symbol followed by comment returns global symbol and comment token', () => {
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

    assert.strictEqual(tokens.length, 2);
    assert.deepStrictEqual(tokens[0],expectedSymbolToken);
    assert.deepStrictEqual(tokens[1],expectedCommentToken);
  });

  test('Local Symbol, colon, comment returns local symbol, colon, comment tokens', () => {
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

    assert.strictEqual(tokens.length, 3);
    assert.deepStrictEqual(tokens[0],expectedSymbolToken);
    assert.deepStrictEqual(tokens[1],expectedColonToken);
    assert.deepStrictEqual(tokens[2],expectedCommentToken);
  });

  ['abx'].forEach(opcode => {

    test(`Inherent opcode ${opcode} returns opcode token`, () => {
      const expectedOpcode = opcode;
      const line = ` ${expectedOpcode}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);

      const tokens = LineParser.parse(line);

      assert.strictEqual(tokens.length, 1);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
    });

    test(`Inherent opcode ${opcode.toUpperCase()} returns opcode (in lowercase) token`, () => {
      const expectedOpcode = opcode;
      const line = ` ${expectedOpcode.toUpperCase()}`;
      const expectedOpcodeToken = new Token(
        expectedOpcode,
        line.indexOf(expectedOpcode.toUpperCase()),
        expectedOpcode.length,
        TokenKind.opCode,
        TokenType.keyword);

      const tokens = LineParser.parse(line);

      assert.strictEqual(tokens.length, 1);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
    });

    test(`Inherent opcode ${opcode}, comment returns opcode, comment tokens`, () => {
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

      assert.strictEqual(tokens.length, 2);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedCommentToken);
    });

    test(`Symbol, inherent opcode ${opcode}, comment returns symbol, opcode, comment tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedSymbolToken);
      assert.deepStrictEqual(tokens[1], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[2], expectedCommentToken);
    });

    test(`Inherent opcode ${opcode}, * comment returns inherent opcode, comment tokens`, () => {
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

      assert.strictEqual(tokens.length, 2);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedCommentToken);
    });

    test(`Symbol, inherent opcode ${opcode}, comment returns symbol, opcode, comment tokens`, () => {
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

      assert.strictEqual(tokens.length, 4);
      assert.deepStrictEqual(tokens[0], expectedSymbolToken);
      assert.deepStrictEqual(tokens[1], expectedColonToken);
      assert.deepStrictEqual(tokens[2], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[3], expectedCommentToken);
    });
  });

  ['clr'].forEach(opcode => {

    test(`Operand opcode ${opcode}, operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Operand opcode ${opcode.toUpperCase()}, operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Operand opcode ${opcode}, comment returns opcode, operand, comment tokens`, () => {
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

      assert.strictEqual(tokens.length, 4);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
      assert.deepStrictEqual(tokens[3], expectedCommentToken);
    });

    test(`Symbol, operand opcode ${opcode}, comment returns symbol, opcode, operand, comment tokens`, () => {
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

      assert.strictEqual(tokens.length, 5);
      assert.deepStrictEqual(tokens[0], expectedSymbolToken);
      assert.deepStrictEqual(tokens[1], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[2], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[3], expectedOperandToken);
      assert.deepStrictEqual(tokens[4], expectedCommentToken);
    });

    test(`Binary % operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Binary b operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Octal @ operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Octal o operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Octal q operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Hexidecimal $ operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Hexidecimal 0x operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Hexidecimal H operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Hexidecimal start 0 end H operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Decimal operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Decimal & operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Symbol * operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Character ' operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Character " operand returns opcode, operand tokens`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Immediate operand returns opcode, Operator, numeric token`, () => {
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

      assert.strictEqual(tokens.length, 4);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedImmediateToken);
      assert.deepStrictEqual(tokens[3], expectedNumberToken);
    });

    test(`Immediate reference operand returns opcode, Operator, numeric token`, () => {
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
        TokenType.class);

      const tokens = LineParser.parse(line);

      assert.strictEqual(tokens.length, 4);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedImmediateToken);
      assert.deepStrictEqual(tokens[3], expectedReferenceToken);
    });

    test(`Immediate register inc operand returns opcode, Operator, numeric token`, () => {
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

      assert.strictEqual(tokens.length, 5);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedCommaToken);
      assert.deepStrictEqual(tokens[3], expectedRegisterToken);
      assert.deepStrictEqual(tokens[4], expectedIncrementToken);
    });
    
    test(`&& operator operand returns opcode, Operator token`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });

    test(`Bad operator operand returns opcode, Operator token`, () => {
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

      assert.strictEqual(tokens.length, 3);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedAllOperandToken);
      assert.deepStrictEqual(tokens[2], expectedOperandToken);
    });
  });

  ['fcc', 'fcn', 'fcs'].forEach(pseudo => {
    test(`${pseudo} string, operand returns opcode, string tokens`, () => {
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

      assert.strictEqual(tokens.length, 2);
      assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
      assert.deepStrictEqual(tokens[1], expectedOperandToken);
    });
  });

  test(`include string, operand returns opcode, string tokens`, () => {
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

    assert.strictEqual(tokens.length, 2);
    assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
    assert.deepStrictEqual(tokens[1], expectedOperandToken);
  });

  test(`warning string, operand returns opcode, string tokens`, () => {
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

    assert.strictEqual(tokens.length, 2);
    assert.deepStrictEqual(tokens[0], expectedOpcodeToken);
    assert.deepStrictEqual(tokens[1], expectedOperandToken);
  });

});
