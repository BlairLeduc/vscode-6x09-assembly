//
// Note: This test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

// Classes under test
import * as parser from '../parsers/assembly-document';
import { AssemblyLine } from '../parsers/assembly-line';
import { ListingLine } from '../parsers/listing-line';
import { AssemblySymbol } from '../common';
import { SymbolManager } from '../managers/symbol';

interface SymbolOrReferenceDefinition {
  range: vscode.Range;
  name: string;
  documentation: string;
  kind: vscode.CompletionItemKind;
  lineRange: vscode.Range;
}

function createRange(line: number, from: number, to: number): vscode.Range {
  return new vscode.Range(new vscode.Position(line, from), new vscode.Position(line, to));
}

function compareSymbolsOrReferences(actual: AssemblySymbol[], expected: SymbolOrReferenceDefinition[]): boolean {
  if (actual.length !== expected.length) {
    return false;
  }

  let count = actual.length;
  while (count--) {
    if (actual[count].documentation !== expected[count].documentation
      || actual[count].kind !== expected[count].kind
      || actual[count].name !== expected[count].name
      || !actual[count].range.isEqual(expected[count].range)
      || !actual[count].lineRange.isEqual(expected[count].lineRange)) {
        return false;
      }
  }
  return true;
}

// Defines a Mocha test suite to group tests of similar kind together
suite('Parser Tests', () => {
  const testFolderLocation = '../../src/test/data';

  test('See comment line from start (asterisk)', () => {
    const text = '* This is a comment';
    const expected = 'This is a comment';

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.comment, expected, 'Comment not captured correctly');
  });

  test('See comment line from start (semicolon)', () => {
    const text = '; This is a comment';
    const expected = 'This is a comment';

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.comment, expected, 'Comment not captured correctly');
  });

  test('See comment line from anywhere (asterisk)', () => {
    const text = '\t\t* This is a comment';
    const expected = 'This is a comment';

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.comment, expected, 'Comment not captured correctly');
  });

  test('See comment line from anywhere (semicolon)', () => {
    const text = '        ; This is a comment';
    const expected = 'This is a comment';

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.comment, expected, 'Comment not captured correctly');
  });

  test('Find label with no label on line', () => {
    const text = ' clra';
    const expected = '';
    const expectedStart = 0;
    const expectedEnd = 0;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.label, expected);
    assert.strictEqual(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label alone on line', () => {
    const text = 'Start';
    const expected = 'Start';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.label, expected);
    assert.strictEqual(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with opcode', () => {
    const text = 'Start   clra';
    const expected = 'Start';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.label, expected);
    assert.strictEqual(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with opcode and operand', () => {
    const text = 'Sta_rt   lda     #$40';
    const expected = 'Sta_rt';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.label, expected);
    assert.strictEqual(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with opcode and operand and comment', () => {
    const text = 'Sta.rt   lda     #$40    load *';
    const expected = 'Sta.rt';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.label, expected);
    assert.strictEqual(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with label and comment (asterisk)', () => {
    const text = 'S$tart            * a comment';
    const expected = 'S$tart';
    const expectedStart = 0;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.label, expected);
    assert.strictEqual(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find label on line with label and comment (semicolon)', () => {
    const text = 'Start@            ; a comment';
    const expected = 'Start@';
    const expectedStart = 0;
    const expectedEnd = expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.label, expected);
    assert.strictEqual(line.labelRange.start.character, expectedStart, 'Label Range start incorrect');
    assert.strictEqual(line.labelRange.end.character, expectedEnd, 'Label Range end incorrect');
  });

  test('Find opcode on line with opcode', () => {
    const text = '   clra';
    const expected = 'clra';
    const expectedStart = 3;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.opcode, expected);
    assert.strictEqual(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find opcode on line with opcode and label', () => {
    const text = 'Start   clra';
    const expected = 'clra';
    const expectedStart = 8;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.opcode, expected);
    assert.strictEqual(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find opcode on line with label and operand', () => {
    const text = 'Sta_rt   lda     #$40';
    const expected = 'lda';
    const expectedStart = 9;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.opcode, expected);
    assert.strictEqual(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find opcode on line with label and operand and comment', () => {
    const text = 'Sta.rt   lda     #$40    load *';
    const expected = 'lda';
    const expectedStart = 9;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.opcode, expected);
    assert.strictEqual(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find operand on line with opcode', () => {
    const text = '   ldb #$40';
    const expected = '#$40';
    const expectedStart = 7;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.operand, expected);
    assert.strictEqual(line.operandRange.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.operandRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find operand on line with opcode', () => {
    const text = 'hello   ldb #$40';
    const expected = '#$40';
    const expectedStart = 12;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.operand, expected);
    assert.strictEqual(line.operandRange.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.operandRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find reference in operand', () => {
    const text = ' ldb #screen';
    const expectedLength = 1;
    const expectedName = 'screen';
    const expectedStart = 6;
    const expectedEnd = expectedStart + expectedName.length;

    const line = new AssemblyLine(text);
    line.parse(null);

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
    line.parse(null);

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
    line.parse(null);

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
    const expectedOperand = ',x+';
    const expectedOperandStart = 17;
    const expectedOperandEnd = expectedOperandStart + expectedOperand.length;
    const expectedComment = 'Test of all';

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.label, expectedLabel, 'Label not captured');
    assert.strictEqual(line.labelRange.start.character, expectedLabelStart, 'Label Range start incorrect');
    assert.strictEqual(line.labelRange.end.character, expectedLabelEnd, 'Label Range end incorrect');
    assert.strictEqual(line.opcode, expectedOpcode, 'Opcode not captured');
    assert.strictEqual(line.opcodeRange.start.character, expectedOpcodeStart, 'Opcode Range start incorrect');
    assert.strictEqual(line.opcodeRange.end.character, expectedOpcodeEnd, 'Opcode Range end incorrect');
    assert.strictEqual(line.operand, expectedOperand, 'Operand not captured');
    assert.strictEqual(line.operandRange.start.character, expectedOperandStart, 'Operand Range start incorrect');
    assert.strictEqual(line.operandRange.end.character, expectedOperandEnd, 'Operand Range end incorrect');
    assert.strictEqual(line.comment, expectedComment, 'Comment not captured');
  });

  test('Find opcode with label named same', () => {
    const text = 'clra   clra';
    const expected = 'clra';
    const expectedStart = 7;
    const expectedEnd = expectedStart + expected.length;

    const line = new AssemblyLine(text);
    line.parse(null);

    assert.strictEqual(line.opcode, expected);
    assert.strictEqual(line.opcodeRange.start.character, expectedStart, 'Range start incorrect');
    assert.strictEqual(line.opcodeRange.end.character, expectedEnd, 'Range end incorrect');
  });

  test('Find reference in operand on line with label and opcode', () => {
    const text = 'hello   ldx   #screen';
    const expectedLength = 1;
    const expectedName = 'screen';
    const expectedStart = 15;
    const expectedEnd = expectedStart + expectedName.length;

    const line = new AssemblyLine(text);
    line.parse(null);

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
    line.parse(null);

    assert.strictEqual(line.references.length, expectedLength);
    line.references.forEach((r, i) => {
      assert.strictEqual(r.name, expected[i].name);
      assert.strictEqual(r.range.start.character, expected[i].start, 'Range start incorrect');
      assert.strictEqual(r.range.end.character, expected[i].end, 'Range end incorrect');
    });
  });

  test('Load document', async () => {
    const uri = vscode.Uri.file(
      path.join(__dirname, testFolderLocation, 'hello-clean.asm')
    );
    const content = await vscode.workspace.openTextDocument(uri);
    const expectedDefinitions: SymbolOrReferenceDefinition[] = [
      { range: createRange(2, 0, 6), name: 'screen', documentation: '', kind: vscode.CompletionItemKind.Constant, lineRange: createRange(2, 0, 15) },
      { range: createRange(3, 0, 5), name: 'hello', documentation: '', kind: vscode.CompletionItemKind.Class, lineRange: createRange(3, 0, 17) },
      { range: createRange(5, 0, 6), name: 'hel010', documentation: '', kind: vscode.CompletionItemKind.Class, lineRange: createRange(5, 0, 14)  },
      { range: createRange(10, 0, 6), name: 'hel020', documentation: '', kind: vscode.CompletionItemKind.Class, lineRange: createRange(10, 0, 14) },
      { range: createRange(14, 0, 4), name: 'loop', documentation: '', kind: vscode.CompletionItemKind.Class, lineRange: createRange(14, 0, 13) },
      { range: createRange(15, 0, 4), name: 'text', documentation: '', kind: vscode.CompletionItemKind.Variable, lineRange: createRange(15, 0, 24) },
    ];
    const expectedReferences: SymbolOrReferenceDefinition[] = [
      { name: 'screen', documentation: '', range: createRange(3, 11, 17), kind: vscode.CompletionItemKind.Reference, lineRange: createRange(3, 0, 17) },
      { name: 'screen', documentation: '', range: createRange(6, 7, 13), kind: vscode.CompletionItemKind.Reference, lineRange: createRange(6, 0, 17) },
      { name: 'hel010', documentation: '', range: createRange(7, 5, 11), kind: vscode.CompletionItemKind.Reference, lineRange: createRange(7, 0, 11) },
      { name: 'text', documentation: '', range: createRange(8, 6, 10), kind: vscode.CompletionItemKind.Reference, lineRange: createRange(8, 0, 10) },
      { name: 'screen', documentation: '', range: createRange(9, 6, 12), kind: vscode.CompletionItemKind.Reference, lineRange: createRange(9, 0, 12) },
      { name: 'loop', documentation: '', range: createRange(11, 5, 9), kind: vscode.CompletionItemKind.Reference, lineRange: createRange(11, 0, 9) },
      { name: 'hel020', documentation: '', range: createRange(13, 5, 11), kind: vscode.CompletionItemKind.Reference, lineRange: createRange(13, 0, 11) },
      { name: 'loop', documentation: '', range: createRange(14, 9, 13), kind: vscode.CompletionItemKind.Reference, lineRange: createRange(14, 0, 13) },
    ];
    const expectedNumberOfLines = 18;
    const symbolManager = new SymbolManager();
    const document = new parser.AssemblyDocument(symbolManager, content);

    assert.strictEqual(document.lines.length, expectedNumberOfLines, 'Expected number of lines do not match');
    assert.ok(compareSymbolsOrReferences(symbolManager.definitions, expectedDefinitions), 'Symbols do not match');
    assert.ok(compareSymbolsOrReferences(symbolManager.references, expectedReferences), 'References do not match');
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
