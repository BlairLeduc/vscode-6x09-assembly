import * as vscode from 'vscode';
import { Logger } from '../../logger';
import { Docs } from '../../parsers';

describe('Docs', () => {
  describe('single doc', () => {
    const docs = new Docs('valid');

    it('should get pseudo-op EQU', async () => {
      await docs.init();
      const pseudoOp = docs.getOpcode('EQU');
      expect(pseudoOp).toBeTruthy();
      expect(pseudoOp?.name).toBe('EQU');
      expect(pseudoOp?.summary).toBe('Set a Symbol to a Value');
    });

    it('should get opcode ADCA', () => {
      const opcode = docs.getOpcode('ADCA');
      expect(opcode).toBeTruthy();
      expect(opcode?.name).toBe('ADCA');
      expect(opcode?.processor).toBe('6809');
      expect(opcode?.conditionCodes).toBe('H=↕ N=↕ Z=↕ V=↕ C=↕');
      expect(opcode?.summary).toBe('Add Memory Byte with Carry into A');
      expect(opcode?.notation).toBe('A\' ← A + M + C');
      expect(opcode?.documentation).toBe('Add A, the C (carry) bit and the memory byte into A.');
    });

    it('should not get opcode LDA', () => {
      const opcode = docs.getOpcode('LDA');
      expect(opcode).toBeFalsy();
    });

    it('should get undefinded for undefined', () => {
      const opcode = docs.getOpcode(undefined);
      expect(opcode).toBeFalsy();
    });
  });

  describe('find docs', () => {
    const docs = new Docs('valid');

    beforeAll(async () => {
      await docs.init();
    });

    it('should find pseudo-ops starting with E', () => {
      const pseudoOps = docs.findOpcode('E');
      expect(pseudoOps.length).toBe(1);
      expect(pseudoOps[0].name).toBe('EQU');
    });

    it('should find opcodes starting with A', () => {
      const opcodes = docs.findOpcode('A');
      expect(opcodes.length).toBe(2);
      expect(opcodes[0].name).toBe('ABX');
      expect(opcodes[1].name).toBe('ADCA');
    });

    it('should not find opcodes starting with L', () => {
      const opcodes = docs.findOpcode('L');
      expect(opcodes.length).toBe(0);
    });
  });

  describe('broken docs', () => {
    const logOutputChannel = vscode.window.createOutputChannel('6x09 Assembly', { log: true });

    beforeAll(() => {
      Logger.init(logOutputChannel);
    });

    it('should log error for broken docs', async () => {
      const docs = new Docs('invalid');
      await docs.init();
      expect(logOutputChannel.error).toHaveBeenCalledTimes(2);
    });
  });
});