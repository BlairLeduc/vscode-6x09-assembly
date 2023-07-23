import * as vscode from 'vscode';

export class DebugConfigurationProvider implements vscode.DebugConfigurationProvider {
  
  public async resolveDebugConfiguration?(
    _folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
    cancellationToken?: vscode.CancellationToken): Promise<vscode.DebugConfiguration | undefined> {

    if (!cancellationToken?.isCancellationRequested) {
      // if launch.json is missing or empty
      if (!config.type && !config.request && !config.name) {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'asm6x09') {
          config.type = 'asm6x09';
          config.name = 'Launch';
          config.request = 'launch';
          config.assemblyFile = '${file}';
        }
      }

      if (config.assemblyFile) {
        return config;
      }

      await vscode.window.showInformationMessage('Cannot find a program to debug.');
    }
  }
}
