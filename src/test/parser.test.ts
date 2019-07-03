//
// Note: This test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

// Classes under test
import * as parser from '../parser';

function createRange(line: number, from: number, to: number): vscode.Range {
  return new vscode.Range(new vscode.Position(line, from), new vscode.Position(line, to));
}

// Defines a Mocha test suite to group tests of similar kind together
suite('Parser Tests', () => {
  const testFolderLocation = '../../src/test/data';

  test('See comment line from start (asterisk)', () => {
    const text = '* This is a comment';
    const expected = '* This is a comment';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.comment, expected, 'Comment not captured correctly');
    assert.equal(line.commentRange.start.character, expectedStart, 'Comment Range start incorrect');
    assert.equal(line.commentRange.end.character, expectedEnd, 'Comment Range end incorrect');
  });

  test('See comment line from start (semicolon)', () => {
    const text = '; This is a comment';
    const expected = '; This is a comment';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.comment, expected, 'Comment not captured correctly');
    assert.equal(line.commentRange.start.character, expectedStart, 'Comment Range start incorrect');
    assert.equal(line.commentRange.end.character, expectedEnd, 'Comment Range end incorrect');
  });

  test('See comment line from anywhere (asterisk)', () => {
    const text = '\t\t* This is a comment';
    const expected = '* This is a comment';
    const expectedStart = 2;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.comment, expected, 'Comment not captured correctly');
    assert.equal(line.commentRange.start.character, expectedStart, 'Comment Range start incorrect');
    assert.equal(line.commentRange.end.character, expectedEnd, 'Comment Range end incorrect');
  });

  test('See comment line from anywhere (semicolon)', () => {
    const text = '        ; This is a comment';
    const expected = '; This is a comment';
    const expectedStart = 8;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.comment, expected, 'Comment not captured correctly');
    assert.equal(line.commentRange.start.character, expectedStart, 'Comment Range start incorrect');
    assert.equal(line.commentRange.end.character, expectedEnd, 'Comment Range end incorrect');
  });

  test('Find label with no label on line', () => {
    const text = ' clra';
    const expected = '';
    const expectedStart = 0;
    const expectedEnd = 0;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.label, expected);
    assert.equal(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.equal(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label alone on line', () => {
    const text = 'Start';
    const expected = 'Start';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.label, expected);
    assert.equal(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.equal(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with opcode', () => {
    const text = 'Start   clra';
    const expected = 'Start';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.label, expected);
    assert.equal(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.equal(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with opcode and operand', () => {
    const text = 'Sta_rt   lda     #$40';
    const expected = 'Sta_rt';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.label, expected);
    assert.equal(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.equal(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with opcode and operand and comment', () => {
    const text = 'Sta.rt   lda     #$40    load *';
    const expected = 'Sta.rt';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.label, expected);
    assert.equal(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.equal(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with label and comment (asterisk)', () => {
    const text = 'S$tart            * a comment';
    const expected = 'S$tart';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.label, expected);
    assert.equal(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.equal(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with label and comment (semicolon)', () => {
    const text = 'Start@            ; a comment';
    const expected = 'Start@';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.label, expected);
    assert.equal(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.equal(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find opcode on line with opcode', () => {
    const text = '   clra';
    const expected = 'clra';
    const expectedStart = 3;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.opcode, expected);
    assert.equal(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.equal(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find opcode on line with opcode and label', () => {
    const text = 'Start   clra';
    const expected = 'clra';
    const expectedStart = 8;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.opcode, expected);
    assert.equal(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.equal(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find opcode on line with label and operand', () => {
    const text = 'Sta_rt   lda     #$40';
    const expected = 'lda';
    const expectedStart = 9;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.opcode, expected);
    assert.equal(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.equal(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find opcode on line with label and operand and comment', () => {
    const text = 'Sta.rt   lda     #$40    load *';
    const expected = 'lda';
    const expectedStart = 9;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.opcode, expected);
    assert.equal(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.equal(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find operand on line with opcode', () => {
    const text = '   ldb #$40';
    const expected = '#$40';
    const expectedStart = 7;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.operand, expected);
    assert.equal(line.operandRange.start.character, expectedStart, 'Range start incorrect');
    assert.equal(line.operandRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find operand on line with opcode', () => {
    const text = 'hello   ldb #$40';
    const expected = '#$40';
    const expectedStart = 12;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.operand, expected);
    assert.equal(line.operandRange.start.character, expectedStart, 'Range start incorrect');
    assert.equal(line.operandRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find all columns on a line', () => {
    const text = 'STA010   lda     ,x+    Test of all';
    const expectedLabel = 'STA010';
    const expectedLabelStart = 0;
    const expectedLabelEnd = expectedLabelStart + expectedLabel.length;
    const expectedOpcode = 'lda';
    const expectedOpcodeStart = 9;
    const expectedOpcodeEnd = expectedOpcodeStart + expectedOpcode.length;
    const expectedOperand = ',x+';
    const expectedOperandStart = 17;
    const expectedOperandEnd = expectedOperandStart + expectedOperand.length;
    const expectedComment = 'Test of all';
    const expectedCommentStart = 24;
    const expectedCommentEnd = expectedCommentStart + expectedComment.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.label, expectedLabel, 'Label not captured');
    assert.equal(line.labelRange.start.character, expectedLabelStart, 'Label Range start incorrect');
    assert.equal(line.labelRange.end.character, expectedLabelEnd, 'Label Range end incorrect');
    assert.equal(line.opcode, expectedOpcode, 'Opcode not captured');
    assert.equal(line.opcodeRange.start.character, expectedOpcodeStart, 'Opcode Range start incorrect');
    assert.equal(line.opcodeRange.end.character, expectedOpcodeEnd, 'Opcode Range end incorrect');
    assert.equal(line.operand, expectedOperand, 'Operand not captured');
    assert.equal(line.operandRange.start.character, expectedOperandStart, 'Operand Range start incorrect');
    assert.equal(line.operandRange.end.character, expectedOperandEnd, 'Operand Range end incorrect');
    assert.equal(line.comment, expectedComment, 'Comment not captured');
    assert.equal(line.commentRange.start.character, expectedCommentStart, 'Comment Range start incorrect');
    assert.equal(line.commentRange.end.character, expectedCommentEnd, 'Comment Range end incorrect');
  });

  test('Find opcode with label named same', () => {
    const text = 'clra   clra';
    const expected = 'clra';
    const expectedStart = 7;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.opcode, expected);
    assert.equal(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.equal(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find reference in operand on line with label and opcode', () => {
    const text = 'hello   ldx   #screen';
    const expected = 'screen';
    const expectedStart = 15;
    const expectedEnd = expectedStart + expected.length;

    const line = new parser.AssemblyLine(text);

    assert.equal(line.reference, expected);
    assert.equal(line.referenceRange.start.character, expectedStart, 'Range start incorrect');
    assert.equal(line.referenceRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Load document', async () => {
    const uri = vscode.Uri.file(
      path.join(__dirname, testFolderLocation, 'hello-clean.asm')
    );
    const content = await vscode.workspace.openTextDocument(uri);
    const expectedSymbols = [
      { range: createRange(2, 0, 6), name: 'screen', documentation: '' },
      { range: createRange(3, 0, 5), name: 'hello', documentation: '' },
      { range: createRange(5, 0, 6), name: 'hel010', documentation: ''  },
      { range: createRange(10, 0, 6), name: 'hel020', documentation: '' },
      { range: createRange(14, 0, 4), name: 'loop', documentation: '' },
      { range: createRange(15, 0, 4), name: 'text', documentation: '' },
    ];
    const expectedReferences = [
      { name: 'screen', documentation: '', range: createRange(3, 11, 17) },
      { name: 'screen', documentation: '', range: createRange(6, 7, 13) },
      { name: 'hel010', documentation: '', range: createRange(7, 5, 11) },
      { name: 'text', documentation: '', range: createRange(8, 6, 10) },
      { name: 'screen', documentation: '', range: createRange(9, 6, 12) },
      { name: 'loop', documentation: '', range: createRange(11, 5, 9) },
      { name: 'hel020', documentation: '', range: createRange(13, 5, 11) },
      { name: 'loop', documentation: '', range: createRange(14, 9, 13) },
    ];
    const expectedNumberOfLines = 18;

    const document = new parser.AssemblyDocument(content);

    assert.deepEqual(document.symbols, expectedSymbols);
    assert.deepEqual(document.references, expectedReferences);
    assert.equal(document.lines.length, expectedNumberOfLines);
  });

});
