import { EventEmitter } from 'events';
import * as fs from 'fs';
//import * as Net from 'net';
import * as vscode from 'vscode';

import { execCmd } from '../utilities';

export interface IGdbBreakpoint {
  id: number;
  line: number;
  verified: boolean;
  originalValue: number;
}

export interface IGdbStackFrame {
  index: number;
  name: string;
  file: string;
  line: number;
  column?: number;
}

export interface IGdbStack {
  count: number;
  frames: IGdbStackFrame[];
}

export class GdbRuntime extends EventEmitter {

  /** Token to cancel the emulator */
  private cancellationTokenSource?: vscode.CancellationTokenSource;

  constructor(private emulatorExe:string, private emulatorOptions: string[], private emulatorWorkingDir: string) {
    super();
  }

  // Run control
  public start(_program: string, _stopOnEntry: boolean, _noDebug: boolean): void {
    vscode.languages
    // Start emulator
    this.startEmulator(this.emulatorExe, this.emulatorOptions, this.emulatorWorkingDir);
  }

  public continue(_reverse = false): void {
    throw new Error('Method not implemented.');
  }

  public step(_reverse = false, _event = 'stopOnStep'): void {
    throw new Error('Method not implemented.');
  }

  // Breakpoints
  public clearBreakPoint(_path: string, _line: number): IGdbBreakpoint | undefined {
    throw new Error('Method not implemented.');
  }

  public clearBreakpoints(_path: string): void {
    throw new Error('Method not implemented.');
  }

  public setBreakPoint(_path: string, _line: number): IGdbBreakpoint {
    throw new Error('Method not implemented.');
  }

  // Stacks
  public stack(_startFrame: number, _endFrame: number): IGdbStack {
    throw new Error('Method not implemented.');
  }

  // Helpers
  protected checkEmulator(emulatorPath: string): Promise<boolean> {
    return new Promise(resolve => {
      fs.exists(emulatorPath, exists => {
        resolve(exists);
      });
    });
  }

  protected startEmulator(emulatorExe: string, emulatorOptions: string[], emulatorWorkingDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.emit('output', `Starting emulator: ${emulatorExe}`);
      if (emulatorExe) {
        // Is the emulator exe present in the filesystem?
        this.checkEmulator(emulatorExe).then(exists => {
          if (exists) {
            this.cancellationTokenSource = new vscode.CancellationTokenSource();
            execCmd(emulatorExe, emulatorOptions, emulatorWorkingDir, this.cancellationTokenSource.token).then(() => {
              this.emit('end');
              resolve();
            }).catch((err: Error) => {
              reject(new Error(`Error raised by the emulator run: ${err.message}`));
            });
          } else {
            reject(new Error(`The emulator executable '${emulatorExe}' cannot be found.`));
          }
        });
      } else {
        reject(new Error('The emulator executable file path must be defined in the launch settings.'));
      }
    });
  }
}