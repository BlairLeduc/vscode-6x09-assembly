import * as vscode from 'vscode';
import { ASM6X09_LANGUAGE, Command, HelpLevel, OpcodeCase } from '../../constants';
import { ExtensionWorkspaceConfiguration, ConfigurationManager } from '../../managers';
import { Logger } from '../../logger';

describe('ConfigurationManager', () => {
  const logOutputChannel = vscode.window.createOutputChannel('6x09 Assembly', { log: true });
  beforeEach(() => {
    logOutputChannel.clear();
    Logger.init(logOutputChannel);
  });

  it('should create', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    expect(configurationManager).toBeTruthy();
  });

  it('should dispose', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    configurationManager.dispose();
    expect(configurationManager.isDisposed).toBe(true);
  });

  it('should update', () => {
    const updateHandler = jest.fn();
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    configurationManager.onDidChangeConfiguration(updateHandler);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE);
    configurationManager.update(config);
    expect(updateHandler).toBeCalled();
    expect(logOutputChannel.info).toBeCalledWith(`Configuration updated for language \"${ASM6X09_LANGUAGE}\"`);
  });

  it('should get opcode casing', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE);
    configurationManager.update(config);
    expect(configurationManager.opcodeCasing).toBe(OpcodeCase.uppercase);
  });

  it('should get helpLevel', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE);
    configurationManager.update(config);
    expect(configurationManager.helpLevel).toBe(HelpLevel.none);
  });

  it('should get isCodeLensEnabled', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE);
    configurationManager.update(config);
    expect(configurationManager.isCodeLensEnabled).toBe(false);
  });

  it('should get debugPort', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE);
    configurationManager.update(config);
    expect(configurationManager.debugPort).toBe(6809);
  });

  it('should get opcode casing (default)', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE) as ExtensionWorkspaceConfiguration;
    config.opcode = undefined as unknown as ExtensionWorkspaceConfiguration['opcode'];
    configurationManager.update(config);
    expect(configurationManager.opcodeCasing).toBe(OpcodeCase.lowercase);
  });

  it('should get isCodeLensEnabled (default)', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE) as ExtensionWorkspaceConfiguration;
    config.enableCodeLens = undefined as unknown as ExtensionWorkspaceConfiguration['enableCodeLens'];
    configurationManager.update(config);
    expect(configurationManager.isCodeLensEnabled).toBe(true);
  });

  it('should get helpLevel (default)', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE) as ExtensionWorkspaceConfiguration;
    config.opcode = undefined as unknown as ExtensionWorkspaceConfiguration['opcode'];
    configurationManager.update(config);
    expect(configurationManager.helpLevel).toBe(HelpLevel.full);
  });

  it('should getCommandConfiguration (xroar)', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE);
    configurationManager.update(config);
    expect(configurationManager.getCommandConfiguration(Command.xroar)?.arguments).toBe('-machine test');
  });

  it('should getCommandConfiguration (xroar default)', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE) as ExtensionWorkspaceConfiguration;
    config.xroar = undefined as unknown as ExtensionWorkspaceConfiguration['xroar'];
    configurationManager.update(config);
    expect(configurationManager.getCommandConfiguration(Command.xroar)?.arguments).toBe('-machine coco2bus');
  });

  it('should getCommandConfiguration (lwasm)', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE);
    configurationManager.update(config);
    expect(configurationManager.getCommandConfiguration(Command.lwasm)?.arguments).toBe('--test');
  });

  it('should getCommandConfiguration (lwasm default)', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE) as ExtensionWorkspaceConfiguration;
    config.lwasm = undefined as unknown as ExtensionWorkspaceConfiguration['lwasm'];
    configurationManager.update(config);
    expect(configurationManager.getCommandConfiguration(Command.lwasm)?.arguments).toBe('--6309');
  });

  it('should getCommandConfiguration (lwasm default)', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE) as ExtensionWorkspaceConfiguration;
    config.lwasm = undefined as unknown as ExtensionWorkspaceConfiguration['lwasm'];
    configurationManager.update(config);
    expect(configurationManager.getCommandConfiguration(Command.lwasm)?.arguments).toBe('--6309');
  });

  it('should get debugPort (default', () => {
    const configurationManager = new ConfigurationManager(ASM6X09_LANGUAGE);
    const config = vscode.workspace.getConfiguration(ASM6X09_LANGUAGE) as ExtensionWorkspaceConfiguration;
    config.debugPort = undefined as unknown as ExtensionWorkspaceConfiguration['debugPort'];
    configurationManager.update(config);
    expect(configurationManager.debugPort).toBe(65520);
  });
});
