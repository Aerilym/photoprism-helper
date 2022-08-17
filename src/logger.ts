import { createLogger, transports, format } from 'winston';

import {
  LoggerConfig,
  LoggerDepth,
  LoggerLevel,
  OptionsConfig,
  ParseLoggerDepth,
  ParseLoggerLevel,
} from './types';
import { envConfig, optionsConfig, logConfig } from './config';

class ExternalLogConfig implements LoggerConfig {
  constructor(config: LoggerConfig) {
    this.file = config.file;
    this.levelConsole = config.levelConsole;
    this.levelFile = config.levelFile;
    this.externalLog = config.externalLog;
    this.externalLog.identity.options = config.externalLog.identity.sendOptions
      ? config.externalLog.identity.options
      : ({} as OptionsConfig);
    this.externalLog.identity.identifier = config.externalLog.identity.anonymised
      ? 'anonymised'
      : config.externalLog.identity.identifier;
    this.externalLog.identity.environment = config.externalLog.identity.anonymised
      ? 'anonymised'
      : config.externalLog.identity.environment;
  }
  file: string;
  levelConsole: ParseLoggerLevel;
  levelFile: ParseLoggerLevel;
  externalLog: {
    enabled: boolean;
    depth: ParseLoggerDepth;
    url: string;
    key: string;
    identity: {
      anonymised: boolean;
      sendOptions: boolean;
      identifier: string;
      version: string;
      environment: string;
      options: OptionsConfig;
    };
  };
}

// Create a logger instance with custom settings
export const logger = createLogger({
  transports: [
    new transports.Console({ level: logConfig.levelConsole.level }),
    new transports.File({
      filename: optionsConfig.logFile,
      level: logConfig.levelFile.level,
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  ],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
});

if (logConfig.levelConsole.invalidLevel) {
  logger.warn(
    'Invalid console logging level provided, defaulting to ' + logConfig.levelConsole.level
  );
}
if (logConfig.levelFile.invalidLevel) {
  logger.warn('Invalid file logging level provided, defaulting to ' + logConfig.levelFile.level);
}

const externalLogConfig = new ExternalLogConfig(logConfig);

if (logConfig.externalLog.enabled) {
  logger.info(`External logging enabled: ${externalLogConfig.externalLog.url}`);
  if (externalLogConfig.externalLog.depth.invalidDepth) {
    logger.warn(
      'Invalid depth provided for external log, defaulting to ' + logConfig.externalLog.depth.depth
    );
  }

  logger.add(
    new transports.Http({
      level: 'info',
      auth: { bearer: externalLogConfig.externalLog.key },
      host: 'localhost',
      port: 2344,
      path: '/log',
    })
  );
  logger.info('test');
  logger.warn('huh');
}
