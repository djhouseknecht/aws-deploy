import { config, LOG_LEVELS, LIB_NAME } from './config';

type TLogLevels = 'debug' | 'info' | 'warn' | 'error';

const logLevel = config.LOG_LEVEL as TLogLevels;

export function log (level: TLogLevels, message: any, ...extras: any[]): void {
  if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(logLevel)) {
    console[level](
      `${LIB_NAME}: [${level.padStart(5)}]`,
      message, ...extras
    );
  }
}