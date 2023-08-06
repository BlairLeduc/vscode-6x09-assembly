import * as vscode from 'vscode';
import { Logger } from '../logger';

describe('Logger', () => {
  describe('no channel passed to init', () => {
    it('should not be initialized', () => {
      expect(Logger.isInitialized).toBeFalsy();
    });
    it('should create a channel', () => {
      Logger.init();
      expect(Logger.isInitialized).toBeTruthy();
    });
  });
  describe('channel passed to init', () => {
    const logOutputChannel = vscode.window.createOutputChannel('6x09 Assembly', { log: true });
    beforeEach(() => {
      Logger.init(logOutputChannel);
    });
    it('should log trace messages', () => {
      Logger.trace('test');
      expect(logOutputChannel.trace).toBeCalledWith('test');
    });
    it('should log debug messages', () => {
      Logger.debug('test');
      expect(logOutputChannel.debug).toBeCalledWith('test');
    });
    it('should log info messages', () => {
      Logger.info('test');
      expect(logOutputChannel.info).toBeCalledWith('test');
    });
    it('should log warn messages', () => {
      Logger.warn('test');
      expect(logOutputChannel.warn).toBeCalledWith('test');
    });
    it('should log error messages', () => {
      Logger.error('test');
      expect(logOutputChannel.error).toBeCalledWith('test');
    });
  });
});