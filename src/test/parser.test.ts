//
// Note: This test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as vscode from 'vscode';

// Classes under test
import { AssemblyLine, ParserState } from '../parsers/assembly-line';
import { ListingLine } from '../parsers/listing-line';

function getState(): ParserState {
  return { lonelyLabels: [], blockNumber: 1 } as ParserState;
}

// Defines a Mocha test suite to group tests of similar kind together
suite('Parser Tests', () => {
  test('See comment line from start (asterisk)', () => {
    const text = '* This is a comment';
    const expected = 'This is a comment';

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected, 'Comment not captured correctly');
  });

  test('See comment line from start (semicolon)', () => {
    const text = '; This is a comment';
    const expected = 'This is a comment';

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected, 'Comment not captured correctly');
  });

  test('See comment line from anywhere (asterisk)', () => {
    const text = '\t\t* This is a comment';
    const expected = 'This is a comment';

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected, 'Comment not captured correctly');
  });

  test('See comment line from anywhere (semicolon)', () => {
    const text = '        ; This is a comment';
    const expected = 'This is a comment';

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected, 'Comment not captured correctly');
  });

  test('Find no label with no label on line', () => {
    const text = ' clra';
    const expected = vscode.CompletionItemKind.Keyword;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.kind, expected);
  });

  test('Find label alone on line', () => {
    const text = 'Start';
    const expected = 'Start';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected);
    assert.strictEqual(line.tokens[0]?.range.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.tokens[0]?.range.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with opcode', () => {
    const text = 'Start   clra';
    const expected = 'Start';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected);
    assert.strictEqual(line.tokens[0]?.range.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.tokens[0]?.range.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with opcode and operand', () => {
    const text = 'Sta_rt   lda     #$40';
    const expected = 'Sta_rt';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected);
    assert.strictEqual(line.tokens[0]?.range.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.tokens[0]?.range.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with opcode and operand and comment', () => {
    const text = 'Sta.rt   lda     #$40    load *';
    const expected = 'Sta.rt';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected);
    assert.strictEqual(line.tokens[0]?.range.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.tokens[0]?.range.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with label and comment (asterisk)', () => {
    const text = 'S$tart            * a comment';
    const expected = 'S$tart';
    const expectedStart = 0;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected);
    assert.strictEqual(line.tokens[0]?.range.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.tokens[0]?.range.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with label and comment (semicolon)', () => {
    const text = 'Start@            ; a comment';
    const expected = 'Start@';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected);
    assert.strictEqual(line.tokens[0]?.range.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.tokens[0]?.range.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find opcode on line with opcode', () => {
    const text = '   clra';
    const expected = 'clra';
    const expectedStart = 3;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expected);
    assert.strictEqual(line.tokens[0]?.range.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.tokens[0]?.range.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find opcode on line with opcode and label', () => {
    const text = 'Start   clra';
    const expected = 'clra';
    const expectedStart = 8;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[1]?.text, expected);
    assert.strictEqual(line.tokens[1]?.range.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.tokens[1]?.range.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find opcode on line with label and operand', () => {
    const text = 'Sta_rt   lda     #$40';
    const expected = 'lda';
    const expectedStart = 9;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[1]?.text, expected);
    assert.strictEqual(line.tokens[1]?.range.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.tokens[1]?.range.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find opcode on line with label and operand and comment', () => {
    const text = 'Sta.rt   lda     #$40    load *';
    const expected = 'lda';
    const expectedStart = 9;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[1]?.text, expected);
    assert.strictEqual(line.tokens[1]?.range.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.tokens[1]?.range.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find operand on line with opcode and operand', () => {
    const text = '   ldb #$40';

    const opExpected = '#';
    const opExpectedKind = vscode.CompletionItemKind.Operator;
    const opExpectedStart = 7;
    const opExpectedEnd = opExpectedStart + opExpected.length;
    const numExpected = '$40';

    const numExpectedKind = vscode.CompletionItemKind.Value;
    const numExpectedStart = 8;
    const numExpectedEnd = numExpectedStart + numExpected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[1]?.text, opExpected);
    assert.strictEqual(line.tokens[1]?.kind, opExpectedKind, "operation kind incorrect");
    assert.strictEqual(line.tokens[1]?.range.start.character, opExpectedStart, 'operation Range start incorrect');
    assert.strictEqual(line.tokens[1]?.range.end.character, opExpectedEnd, 'operation Range end incorrect');
    assert.strictEqual(line.tokens[2]?.text, numExpected);
    assert.strictEqual(line.tokens[2]?.kind, numExpectedKind, "number kind incorrect");
    assert.strictEqual(line.tokens[2]?.range.start.character, numExpectedStart, 'number Range start incorrect');
    assert.strictEqual(line.tokens[2]?.range.end.character, numExpectedEnd, 'numberRange end incorrect');
  });

  test('Find operand on line with label, opcode, and operand', () => {
    const text = 'hello   ldb #$40';
    const opExpected = '#';
    const opExpectedKind = vscode.CompletionItemKind.Operator;
    const opExpectedStart = 12;
    const opExpectedEnd = opExpectedStart + opExpected.length;
    const numExpected = '$40';

    const numExpectedKind = vscode.CompletionItemKind.Value;
    const numExpectedStart = 13;
    const numExpectedEnd = numExpectedStart + numExpected.length;
    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[2]?.text, opExpected);
    assert.strictEqual(line.tokens[2]?.kind, opExpectedKind, "operation kind incorrect");
    assert.strictEqual(line.tokens[2]?.range.start.character, opExpectedStart, 'operation Range start incorrect');
    assert.strictEqual(line.tokens[2]?.range.end.character, opExpectedEnd, 'operation Range end incorrect');
    assert.strictEqual(line.tokens[3]?.text, numExpected);
    assert.strictEqual(line.tokens[3]?.kind, numExpectedKind, "number kind incorrect");
    assert.strictEqual(line.tokens[3]?.range.start.character, numExpectedStart, 'number Range start incorrect');
    assert.strictEqual(line.tokens[3]?.range.end.character, numExpectedEnd, 'numberRange end incorrect');
  });

  test('Find reference in operand', () => {
    const text = ' ldb #screen';
    const expectedLength = 1;
    const expectedName = 'screen';
    const expectedStart = 6;
    const expectedEnd = expectedStart + expectedName.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.references.length, expectedLength);
    assert.strictEqual(line.references[0].name, expectedName);
    assert.strictEqual(line.references[0].range.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.references[0].range.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find multiple references in operand', () => {
    const text = ' ldx   #screen+start+one';
    const expectedLength = 3;
    const expected = [
      {
        name: 'screen',
        start: 8,
        end: 8 + 6
      },
      {
        name: 'start',
        start: 15,
        end: 15 + 5
      },
      {
        name: 'one',
        start: 21,
        end:  21 + 3
      }
    ];

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.references.length, expectedLength);
    line.references.forEach((r, i) => {
      assert.strictEqual(r.name, expected[i].name);
      assert.strictEqual(r.range.start.character, expected[i].start, 'Range start incorrect');
      assert.strictEqual(r.range.end.character, expected[i].end, 'Range end incorrect');
    });
  });

  test('Should not find symbol in operand', () => {
    const text = ' org $3f00';
    const expected = 0;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.references.length, expected);
  });

  test('Find all columns on a line', () => {
    const text = 'STA010   lda     ,x+    Test of all';
    const expectedLabel = 'STA010';
    const expectedLabelStart = 0;
    const expectedLabelEnd = expectedLabelStart + expectedLabel.length;
    const expectedOpcode = 'lda';
    const expectedOpcodeStart = 9;
    const expectedOpcodeEnd = expectedOpcodeStart + expectedOpcode.length;
    const expectedOperand1 = ',';
    const expectedOperandStart1 = 17;
    const expectedOperandEnd1 = expectedOperandStart1 + expectedOperand1.length;
    const expectedOperand2 = 'x';
    const expectedOperandStart2 = 18;
    const expectedOperandEnd2 = expectedOperandStart2 + expectedOperand2.length;
    const expectedOperand3 = '+';
    const expectedOperandStart3 = 19;
    const expectedOperandEnd3 = expectedOperandStart3 + expectedOperand3.length;
    const expectedComment = 'Test of all';

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[0]?.text, expectedLabel, 'Label not captured');
    assert.strictEqual(line.tokens[0]?.range.start.character, expectedLabelStart, 'Label Range start incorrect');
    assert.strictEqual(line.tokens[0]?.range.end.character, expectedLabelEnd, 'Label Range end incorrect');
    assert.strictEqual(line.tokens[1]?.text, expectedOpcode, 'Opcode not captured');
    assert.strictEqual(line.tokens[1]?.range.start.character, expectedOpcodeStart, 'Opcode Range start incorrect');
    assert.strictEqual(line.tokens[1]?.range.end.character, expectedOpcodeEnd, 'Opcode Range end incorrect');
    assert.strictEqual(line.tokens[2]?.text, expectedOperand1, 'Operand not captured');
    assert.strictEqual(line.tokens[2]?.range.start.character, expectedOperandStart1, 'Operand Range start incorrect');
    assert.strictEqual(line.tokens[2]?.range.end.character, expectedOperandEnd1, 'Operand Range end incorrect');
    assert.strictEqual(line.tokens[3]?.text, expectedOperand2, 'Operand not captured');
    assert.strictEqual(line.tokens[3]?.range.start.character, expectedOperandStart2, 'Operand Range start incorrect');
    assert.strictEqual(line.tokens[3]?.range.end.character, expectedOperandEnd2, 'Operand Range end incorrect');
    assert.strictEqual(line.tokens[4]?.text, expectedOperand3, 'Operand not captured');
    assert.strictEqual(line.tokens[4]?.range.start.character, expectedOperandStart3, 'Operand Range start incorrect');
    assert.strictEqual(line.tokens[4]?.range.end.character, expectedOperandEnd3, 'Operand Range end incorrect');
    assert.strictEqual(line.tokens[5]?.text, expectedComment, 'Comment not captured');
  });

  test('Find opcode with label named same', () => {
    const text = 'clra   clra';
    const expected = 'clra';
    const expectedStart = 7;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.tokens[1]?.text, expected);
    assert.strictEqual(line.tokens[1]?.range.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.tokens[1]?.range.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find reference in operand on line with label and opcode', () => {
    const text = 'hello   ldx   #screen';
    const expectedLength = 1;
    const expectedName = 'screen';
    const expectedStart = 15;
    const expectedEnd = expectedStart + expectedName.length;

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.references.length, expectedLength);
    assert.strictEqual(line.references[0].name, expectedName);
    assert.strictEqual(line.references[0].range.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.references[0].range.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find multiple references in operand on line with label and opcode', () => {
    const text = 'hello   ldx   #screen+start+one';
    const expectedLength = 3;
    const expected = [
      {
        name: 'screen',
        start: 15,
        end: 15 + 6
      },
      {
        name: 'start',
        start: 22,
        end: 22 + 5
      },
      {
        name: 'one',
        start: 28,
        end:  28 + 3
      }
    ];

    const line = new AssemblyLine(text);
    line.parse(getState());

    assert.strictEqual(line.references.length, expectedLength);
    line.references.forEach((r, i) => {
      assert.strictEqual(r.name, expected[i].name);
      assert.strictEqual(r.range.start.character, expected[i].start, 'Range start incorrect');
      assert.strictEqual(r.range.end.character, expected[i].end, 'Range end incorrect');
    });
  });

  test('Line with only file and line number', () => {
    const text = '                      (      monitor.asm):00001         *****************************************';
    const expectedAddress = -1;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 1;
    const expectedValue = '';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    assert.strictEqual(line.address, expectedAddress, 'address not captured correctly');
    assert.strictEqual(line.file, expectedFile, 'file not captured correctly');
    assert.strictEqual(line.lineNumber, expectedLineNumber, 'lineNumber not captured correctly');
    assert.strictEqual(line.value, expectedValue, 'value not captured correctly');
    assert.strictEqual(line.continuation, expectedConinuation, 'continuation not set correctly');
  });

  test('Line with value, file and line number', () => {
    const text = '     FF41             (      monitor.asm):00009         BeckerStatus    equ     $FF41           Status register for becker port';
    const expectedAddress = -1;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 9;
    const expectedValue = 'FF41';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    assert.strictEqual(line.address, expectedAddress, 'address not captured correctly');
    assert.strictEqual(line.file, expectedFile, 'file not captured correctly');
    assert.strictEqual(line.lineNumber, expectedLineNumber, 'lineNumber not captured correctly');
    assert.strictEqual(line.value, expectedValue, 'value not captured correctly');
    assert.strictEqual(line.continuation, expectedConinuation, 'continuation not set correctly');
  });

  test('Line with address, value, file and line number', () => {
    const text = '7800 8D47             (      monitor.asm):00017         Monitor         bsr     Cls';
    const expectedAddress = 0x7800;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 17;
    const expectedValue = '8D47';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    assert.strictEqual(line.address, expectedAddress, 'address not captured correctly');
    assert.strictEqual(line.file, expectedFile, 'file not captured correctly');
    assert.strictEqual(line.lineNumber, expectedLineNumber, 'lineNumber not captured correctly');
    assert.strictEqual(line.value, expectedValue, 'value not captured correctly');
    assert.strictEqual(line.continuation, expectedConinuation, 'continuation not set correctly');
  });

  test('Line with data continuation', () => {
    const text = '     6F726C642100';
    const expectedAddress = -1;
    const expectedFile = '';
    const expectedLineNumber = -1;
    const expectedValue = '6F726C642100';
    const expectedConinuation = true;

    const line = new ListingLine(text);

    assert.strictEqual(line.address, expectedAddress, 'address not captured correctly');
    assert.strictEqual(line.file, expectedFile, 'file not captured correctly');
    assert.strictEqual(line.lineNumber, expectedLineNumber, 'lineNumber not captured correctly');
    assert.strictEqual(line.value, expectedValue, 'value not captured correctly');
    assert.strictEqual(line.continuation, expectedConinuation, 'continuation not set correctly');
  });

  test('Line with macro usage', () => {
    const text = '                      (      monitor.asm):00047                         __mon_init';
    const expectedAddress = -1;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 47;
    const expectedValue = '';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    assert.strictEqual(line.address, expectedAddress, 'address not captured correctly');
    assert.strictEqual(line.file, expectedFile, 'file not captured correctly');
    assert.strictEqual(line.lineNumber, expectedLineNumber, 'lineNumber not captured correctly');
    assert.strictEqual(line.value, expectedValue, 'value not captured correctly');
    assert.strictEqual(line.continuation, expectedConinuation, 'continuation not set correctly');
  });

  test('Blank line', () => {
    const text = '                      (      monitor.asm):00044         ';
    const expectedAddress = -1;
    const expectedFile = 'monitor.asm';
    const expectedLineNumber = 44;
    const expectedValue = '';
    const expectedConinuation = false;

    const line = new ListingLine(text);

    assert.strictEqual(line.address, expectedAddress, 'address not captured correctly');
    assert.strictEqual(line.file, expectedFile, 'file not captured correctly');
    assert.strictEqual(line.lineNumber, expectedLineNumber, 'lineNumber not captured correctly');
    assert.strictEqual(line.value, expectedValue, 'value not captured correctly');
    assert.strictEqual(line.continuation, expectedConinuation, 'continuation not set correctly');
  });
});
