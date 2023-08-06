export class Logger {
  private static spy: (lvl: string, msg: string) => void;
  
  public static init(spy?: (lvl: string, msg: string) => void): void {
    this.spy = spy ? spy : (_lvl: string, _msg: string) => {};
  }

  public static trace(_msg: string): void {
    this.spy('trace', _msg);
  }

  public static debug(_msg: string): void {
    this.spy('debug', _msg);
  }

  public static info(_msg: string): void {
    this.spy('info', _msg);
  }

  public static warn(_msg: string): void {
    this.spy('warn', _msg);
  }

  public static error(_msg: string): void {
    this.spy('error', _msg);
  }
}
