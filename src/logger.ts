import { createLogger, transports, format } from 'winston';
import Transport from 'winston-transport';
import axios from 'axios';

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

interface AxiosTransportOptions extends Transport.TransportStreamOptions {
  host: string;
  auth: string;
  path: string;
  headers?: object;
  batch?: boolean;
  batchInterval?: number;
  batchCount?: number;
  replacer?: (key: string, value: any) => any;
}

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
class AxiosTransport extends Transport {
  host: string;
  auth: string;
  path: string;

  constructor(opts: AxiosTransportOptions) {
    super(opts);

    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
    this.host = opts.host;
    this.auth = opts.auth;
    this.path = opts.path;
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    axios
      .post(this.host + this.path, info, {
        headers: { Authorization: 'Bearer ' + this.auth },
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });

    // Perform the writing to the remote service

    callback();
  }
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
    new AxiosTransport({
      level: 'info',
      auth: externalLogConfig.externalLog.key,
      host: externalLogConfig.externalLog.url,
      path: 'log',
    })
  );
}
