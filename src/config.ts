import dotenv from 'dotenv';
dotenv.config();

import { EnvConfig, LoggerConfig, OptionsConfig } from './types';
import { parseBool, cleanUrl, parseLoggerDepth, parseLoggerLevel } from './helper';

const e = process.env;

export const envConfig: EnvConfig = {
  baseUrl: e.PHOTOPRISM_SITE_URL
    ? cleanUrl(e.PHOTOPRISM_SITE_URL, 'http://localhost:2342/')
    : 'http://localhost:2342/',
  hostPort: e.HOSTPORT ? parseInt(e.HOSTPORT) : 2343,
  user: e.PHOTOPRISM_USERNAME ? e.PHOTOPRISM_USERNAME : 'admin',
  pass: e.PHOTOPRISM_PASSWORD ? e.PHOTOPRISM_PASSWORD : '',
  apiKey: e.APIKEY ? e.APIKEY : 'testkey',
};

export const optionsConfig: OptionsConfig = {
  isDocker: e.ISDOCKER ? parseBool(e.ISDOCKER) : false,
  timezone: e.TIMEZONE ? e.TIMEZONE : 'Australia/Melbourne',
  logFile: e.LOGFILE ? e.LOGFILE : 'logs/local.log',
  importOptions: {
    successTimeout: e.IMPORT_TIMEOUT ? parseInt(e.IMPORT_TIMEOUT) : 300000,
    autoImport: e.AUTO_IMPORT ? parseBool(e.AUTO_IMPORT) : false,
    autoImportCron: e.AUTO_IMPORT_CRON ? e.AUTO_IMPORT_CRON : '0 0 5 * * * *',
    indexAfterAutoImport: e.INDEX_AFTER_AUTO_IMPORT ? parseBool(e.INDEX_AFTER_AUTO_IMPORT) : false,
  },
};

export const logConfig: LoggerConfig = {
  file: e.LOGFILE ? e.LOGFILE : 'logs/local.log',
  levelConsole: e.LOGLEVEL_CONSOLE ? parseLoggerLevel(e.LOGLEVEL_CONSOLE) : { level: 'info' },
  levelFile: e.LOGLEVEL_FILE ? parseLoggerLevel(e.LOGLEVEL_FILE) : { level: 'error' },
  externalLog: {
    enabled: e.EXTERNAL_LOG ? parseBool(e.EXTERNAL_LOG) : false,
    depth: e.EXTERNAL_LOG_DEPTH ? parseLoggerDepth(e.EXTERNAL_LOG_DEPTH) : { depth: 'info' },
    url: e.EXTERNAL_LOG_URL
      ? cleanUrl(e.EXTERNAL_LOG_URL, 'http://localhost:2344/log')
      : 'http://localhost:2344/log',
    key: e.EXTERNAL_LOG_KEY ? e.EXTERNAL_LOG_KEY : 'testkey',
    identity: {
      anonymised: e.EXTERNAL_LOG_IDENTITY_ANONYMISED
        ? parseBool(e.EXTERNAL_LOG_IDENTITY_ANONYMISED)
        : false,
      sendOptions: e.EXTERNAL_LOG_IDENTITY_SEND_OPTIONS
        ? parseBool(e.EXTERNAL_LOG_IDENTITY_SEND_OPTIONS)
        : false,
      identifier: '',
      version: '',
      environment: '',
      options: optionsConfig,
    },
  },
};