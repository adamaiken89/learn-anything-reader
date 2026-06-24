import pino from 'pino/browser';

export const logger = pino({
  level: import.meta.env.DEV ? 'debug' : 'info',
});
