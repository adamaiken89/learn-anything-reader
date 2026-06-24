declare module 'pino/browser' {
  interface LoggerOptions {
    level?: string;
    browser?: Record<string, unknown>;
  }
  interface Logger {
    level: string;
    debug(obj: unknown, msg?: string, ...args: unknown[]): void;
    debug(msg: string, ...args: unknown[]): void;
    info(obj: unknown, msg?: string, ...args: unknown[]): void;
    info(msg: string, ...args: unknown[]): void;
    warn(obj: unknown, msg?: string, ...args: unknown[]): void;
    warn(msg: string, ...args: unknown[]): void;
    error(obj: unknown, msg?: string, ...args: unknown[]): void;
    error(msg: string, ...args: unknown[]): void;
  }
  export default function pino(opts?: LoggerOptions): Logger;
}
