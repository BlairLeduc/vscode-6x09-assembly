import { LogOutputChannel, window } from 'vscode';

export class Logger {
  private static channel: LogOutputChannel;
  
  public static init(channel?: LogOutputChannel): void {
    Logger.channel = channel ?? window.createOutputChannel('6x09 Assembly', { log: true });
  }

  public static trace(msg: string): void {
    Logger.channel.trace(msg);
  }

  public static debug(msg: string): void {
    Logger.channel.debug(msg);
  }

  public static info(msg: string): void {
    Logger.channel.info(msg);
  }

  public static warn(msg: string): void {
    Logger.channel.warn(msg);
  }

  public static error(msg: string): void {
    Logger.channel.error(msg);
  }
}