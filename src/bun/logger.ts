import { appendFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

const isDev = process.env.NODE_ENV !== 'production';

const LOG_DIR = join(process.env.HOME || '~', '.coursereader', 'logs');
const LOG_RETENTION_DAYS = 7;

function ensureLogDir() {
  try {
    mkdirSync(LOG_DIR, { recursive: true });
  } catch {}
}

function cleanupOldLogs() {
  try {
    const now = Date.now();
    const files = readdirSync(LOG_DIR);
    for (const file of files) {
      if (!file.startsWith('app-') || !file.endsWith('.log')) continue;
      const filePath = join(LOG_DIR, file);
      const stat = Bun.file(filePath);
      if (stat.lastModified < now - LOG_RETENTION_DAYS * 86400000) {
        unlinkSync(filePath);
      }
    }
  } catch {}
}

function getLogFile(): string {
  const date = new Date().toISOString().split('T')[0];
  return join(LOG_DIR, `app-${date}.log`);
}

function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

function formatEntry(level: string, msg: unknown, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (meta !== undefined) {
    return `${prefix} ${msg} ${safeStringify(meta)}\n`;
  }
  return `${prefix} ${msg}\n`;
}

function writeToFile(entry: string) {
  try {
    appendFileSync(getLogFile(), entry);
  } catch {}
}

let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;
  ensureLogDir();
  cleanupOldLogs();
}

function log(level: string, ...args: unknown[]) {
  init();

  const consolePrefix = isDev ? `[${level.toUpperCase()}]` : '';
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  let msg: unknown;
  let meta: unknown;

  if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
    msg = args[0];
    fn(consolePrefix, args[0]);
  } else if (args.length >= 2 && typeof args[1] === 'object' && args[1] !== null) {
    msg = args[0];
    meta = args[1];
    fn(consolePrefix, args[0], args[1]);
  } else {
    msg = args.join(' ');
    fn(consolePrefix, ...args);
  }

  writeToFile(formatEntry(level, msg, meta));
}

export const logger = {
  info: (msg: unknown, ...args: unknown[]) => log('info', msg, ...args),
  warn: (msg: unknown, ...args: unknown[]) => log('warn', msg, ...args),
  error: (msg: unknown, ...args: unknown[]) => log('error', msg, ...args),
  debug: (msg: unknown, ...args: unknown[]) => {
    if (isDev) log('debug', msg, ...args);
  },
};
