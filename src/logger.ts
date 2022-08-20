import { createLogger, transports, format } from 'winston';
import { AxiosTransport } from 'winston-axios';

import { LoggerConfig, OptionsConfig, ParseLoggerDepth, ParseLoggerLevel } from './types';
import { optionsConfig, logConfig, configMessages } from './config';

class ExternalLogConfig implements LoggerConfig {
  constructor(config: LoggerConfig) {
    this.file = config.file;
    this.levelConsole = config.levelConsole;
    this.levelFile = config.levelFile;
    this.sendErrors = config.sendErrors;
    this.errorLogUrl = config.errorLogUrl;
    this.errorLogKey = config.errorLogKey;
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
  sendErrors: boolean;
  errorLogUrl: string;
  errorLogKey: string;
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
      filename: optionsConfig.logFilePath,
      level: logConfig.levelFile.level,
    }),
  ],
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  exitOnError: false,
});

const externalLogConfig = new ExternalLogConfig(logConfig);

// Call exceptions.handle with a transport to handle exceptions
if (logConfig.sendErrors) {
  const externalBodyAddons = {
    identifiers: {
      anonymised: externalLogConfig.externalLog.identity.anonymised,
      sendOptions: externalLogConfig.externalLog.identity.sendOptions,
      identifier: externalLogConfig.externalLog.identity.identifier,
      version: externalLogConfig.externalLog.identity.version,
      environment: externalLogConfig.externalLog.identity.environment,
      options: externalLogConfig.externalLog.identity.options,
    },
  };

  logger.exceptions.handle(
    new AxiosTransport({
      url: logConfig.errorLogUrl,
      auth: logConfig.errorLogKey,
      authType: 'bearer',
      bodyAddons: externalLogConfig.externalLog.identity.options,
    })
  );
  logger.rejections.handle(
    new AxiosTransport({
      url: logConfig.errorLogUrl,
      auth: logConfig.errorLogKey,
      authType: 'bearer',
      bodyAddons: externalBodyAddons,
    })
  );
}

logger.info(`Timezone set to ${optionsConfig.timezone}`);

if (logConfig.levelConsole.invalidLevel) {
  logger.warn(
    'Invalid console logging level provided, defaulting to ' + logConfig.levelConsole.level
  );
}
if (logConfig.levelFile.invalidLevel) {
  logger.warn('Invalid file logging level provided, defaulting to ' + logConfig.levelFile.level);
}

if (logConfig.externalLog.enabled) {
  logger.info(`External logging enabled: ${externalLogConfig.externalLog.url}`);
  if (externalLogConfig.externalLog.depth.invalidDepth) {
    logger.warn(
      'Invalid depth provided for external log, defaulting to ' + logConfig.externalLog.depth.depth
    );
  }

  logger.add(
    new AxiosTransport({
      level: 'info',
      auth: externalLogConfig.externalLog.key,
      url: externalLogConfig.externalLog.url,
      path: 'log',
    })
  );
}

for (const message of configMessages) {
  logger.warn(message);
}
