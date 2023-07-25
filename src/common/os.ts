import * as vscode from 'vscode';
import * as cp from 'child_process';
import { OSPlatform } from '../constants';
import { Logger } from '../logger';

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
  if (process) {
    try {
      process.kill();
    } catch (e) {
      Logger.error(`${process.pid}:M: Error killing process (${details}): ${e}`);
    }
    Logger.info(`${process.pid}:M: Killed proccess (${details})`);
  }
}

export async function execCmd(
  cmd: string,
  args: string[],
  cwd: string,
  token?: vscode.CancellationToken): Promise<cp.ChildProcess | undefined> {

    const details = [cmd, ...args].join(' ');

    const process = cp.execFile(cmd, args, { cwd });

    if (process.pid) {

      process.stdout?.on('data', (data: string) => {
        data.split(/\r?\n/).forEach(line => {
          Logger.info(`${process.pid}:O: ${line}`);
        });
      });

      process.stderr?.on('data', (data: string) => {
        data.split(/\r?\n/).forEach(line => {
          Logger.info(`${process.pid}:E: ${line}`);
        });
      });

      process.on('error', err => {
        Logger.error(
          `${process.pid}:M: Error executing procces ${process.pid} (${details}): ${err.message}`);

        vscode.window.showErrorMessage(err.message);
      });

      process.on('exit', (code, signal) => {
        if (code) {
          Logger.info(
            `${process.pid}:M: Exited (${[cmd, ...args].join(' ')}) with code: ${code}`);
        } else if (signal) {
          Logger.info(
            `${process.pid}:M: Exited (${[cmd, ...args].join(' ')}) from signal: ${signal}`);
        } else {
          Logger.info(
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

      Logger.info(
        `${process.pid}:M: Started (${[cmd, ...args].join(' ')}) in "${cwd}"`);
      return process;
    }
    Logger.error(`${process.pid} Unable to start process (${details}) in "${cwd}"`);
    vscode.window.showErrorMessage(`Unable to start process (${details}) in "${cwd}"`);
}
