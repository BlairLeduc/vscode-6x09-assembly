import * as vscode from 'vscode';

export class WindowManager implements vscode.Disposable {

  private channel = vscode.window.createOutputChannel('6x09 Assembly');

  public get outputChannel(): vscode.OutputChannel {
    return this.channel;
  }

  public dispose(): void {
    this.channel.dispose();
  }

  public showErrorMessage(message: string): void {
    vscode.window.showErrorMessage(message);
  }

  public showInformationMessage(message: string): void {
    vscode.window.showInformationMessage(message);
  }

  public showWarningMessage(message: string): void {
    vscode.window.showWarningMessage(message);
  }
}