import * as vscode from 'vscode';

export const ASM6X09_LANGUAGE = 'asm6x09';
export const ASM6X09_CONFIG_SECTION = '6x09Assembly';
export const ASM6X09_MODE: vscode.DocumentSelector = { scheme: 'file', language: ASM6X09_LANGUAGE };
export const ASM6X09_FILE_EXTENSIONS = ['.asm', '.s', '.d', '.defs'];
export const ASM6X09_FILE_GLOB_PATTERN = `**/*.{s,d,asm,defs}`;
