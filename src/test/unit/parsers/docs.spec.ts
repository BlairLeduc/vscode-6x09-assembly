//
// Note: This it is leveraging the Mocha it framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import { expect } from 'chai';
import { Docs } from '../../../parsers/docs';
// import * as sinon from 'sinon';
// import { DocOpcode, DocOpcodeType, Docs } from '../../parsers/docs';
// import { Logger } from '../../fakes/logger';

describe('Docs', () => {
  describe('pseudo ops', () => {
    it('should parse opcodes', async () => {
      const docs = new Docs(__dirname);
      await docs.init();
      expect(true).to.equal(true);
    });
  });
  describe('opcodes', () => {
    it('should parse opcodes', () => {
      expect(true).to.equal(true);
    });
  });
});