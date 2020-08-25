import * as vscode from 'vscode';
import { GdbDebugSession } from './gdb-debug-session';

export class DebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {

  public createDebugAdapterDescriptor(vscSession: vscode.DebugSession, executable: vscode.DebugAdapterExecutable): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {

      // make VS Code connect to debug server
      return new vscode.DebugAdapterInlineImplementation(new GdbDebugSession());
  }
}