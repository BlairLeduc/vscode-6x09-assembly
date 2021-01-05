import * as vscode from 'vscode';

export class DebugConfigurationProvider implements vscode.DebugConfigurationProvider {
  
  public resolveDebugConfiguration?(_folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, _token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
    return new Promise(resolve => {
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

      if (!config.assemblyFile) {
        resolve(vscode.window.showInformationMessage('Cannot find a program to debug.').then(_ => {
          return undefined;	// abort launch
        }));
      }

      resolve(config);
    });
  }
}
