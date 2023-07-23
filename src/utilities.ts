import * as cp from 'child_process';
import * as vscode from 'vscode';
import { extensionState } from './extension';
import { OpcodeCase, OSPlatform } from './managers/configuration';

export function convertToCase(name: string, casing: OpcodeCase): string {
  if (casing === OpcodeCase.lowercase) {
    return name.toLowerCase();
  }
  if (casing === OpcodeCase.capitalised) {
    return name[0].toUpperCase() + name.substr(1).toLowerCase();
  }
  return name.toUpperCase();
}

export function convertToSymbolKind(kind: string): vscode.SymbolKind {
  return vscode.SymbolKind[kind as keyof typeof vscode.SymbolKind];
}

export function getOSPlatform(): OSPlatform {
  switch(process.platform) {
    case 'darwin':
        return OSPlatform.macOS;
    case 'win32':
        return OSPlatform.windows;
    default:
        return OSPlatform.linux;
  }
}


export function killProcess(process: cp.ChildProcess, details = ''): void {
  const outputChannel = extensionState.windowManager.outputChannel;

  if (process) {
    try {
      process.kill();
    } catch (e) {
      outputChannel.appendLine(`${process.pid}:M: Error killing process (${details}): ${e}`);
    }
    outputChannel.appendLine(`${process.pid}:M: Killed proccess (${details})`);
  }
}

export async function execCmd(
  cmd: string,
  args: string[],
  cwd: string,
  token?: vscode.CancellationToken): Promise<cp.ChildProcess | undefined> {

    const outputChannel = extensionState.windowManager.outputChannel;

    const details = [cmd, ...args].join(' ');

    const process = cp.execFile(cmd, args, { cwd });

    if (process.pid) {

      process.stdout?.on('data', (data: string) => {
        data.split(/\r?\n/).forEach(line => {
          outputChannel.appendLine(`${process.pid}:O: ${line}`);
        });
      });

      process.stderr?.on('data', (data: string) => {
        data.split(/\r?\n/).forEach(line => {
          outputChannel.appendLine(`${process.pid}:E: ${line}`);
        });
      });

      process.on('error', err => {
        outputChannel.appendLine(
          `${process.pid}:M: Error executing procces ${process.pid} (${details}): ${err.message}`);

        extensionState.windowManager.showErrorMessage(err.message);
      });

      process.on('exit', (code, signal) => {
        if (code) {
          outputChannel.appendLine(
            `${process.pid}:M: Exited (${[cmd, ...args].join(' ')}) with code: ${code}`);
        } else if (signal) {
          outputChannel.appendLine(
            `${process.pid}:M: Exited (${[cmd, ...args].join(' ')}) from signal: ${signal}`);
        } else {
          outputChannel.appendLine(
            `${process.pid}:M: Exited (${[cmd, ...args].join(' ')}) normally.`);
        }
      });

      if (token) {
        token.onCancellationRequested(() => {
          if (process) {
            killProcess(process);
          }
        });
      }

      outputChannel.appendLine(
        `${process.pid}:M: Started (${[cmd, ...args].join(' ')}) in "${cwd}"`);
      return process;
    }
    extensionState.windowManager
      .showErrorMessage(`Unable to start process (${details}) in "${cwd}"`);
}
