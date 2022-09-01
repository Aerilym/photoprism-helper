import dotenv from 'dotenv';
import cron from 'node-cron';

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
  timezone: e.TIMEZONE ? e.TIMEZONE : 'Australia/Melbourne',
  logFilePath: e.LOGFILE_PATH ? e.LOGFILE_PATH : 'logs/local.log',
  prismApi: {
    default: {
      timeout: 30000,
    },
    importOptions: {
      timeout: e.IMPORT_TIMEOUT ? parseInt(e.IMPORT_TIMEOUT) : 30000,
      move: e.MOVE_ON_IMPORT ? parseBool(e.MOVE_ON_IMPORT) : false,
      autoImport: e.AUTO_IMPORT ? parseBool(e.AUTO_IMPORT) : false,
      autoImportCron: e.AUTO_IMPORT_CRON ? e.AUTO_IMPORT_CRON : '0 0 4 * * * *',
      indexAfterAutoImport: e.INDEX_AFTER_AUTO_IMPORT
        ? parseBool(e.INDEX_AFTER_AUTO_IMPORT)
        : false,
    },
    indexOptions: {
      timeout: e.INDEX_TIMEOUT ? parseInt(e.INDEX_TIMEOUT) : 30000,
      rescan: e.INDEX_RESCAN ? parseBool(e.INDEX_RESCAN) : false,
      skipArchived: e.INDEX_SKIP_ARCHIVED ? parseBool(e.INDEX_SKIP_ARCHIVED) : false,
      autoIndex: e.AUTO_INDEX ? parseBool(e.AUTO_INDEX) : false,
      autoIndexCron: e.AUTO_INDEX_CRON ? e.AUTO_INDEX_CRON : '0 0 6 * * * *',
    },
  },
};

export const logConfig: LoggerConfig = {
  file: e.LOGFILE ? e.LOGFILE : 'logs/local.log',
  levelConsole: e.LOGLEVEL_CONSOLE ? parseLoggerLevel(e.LOGLEVEL_CONSOLE) : { level: 'info' },
  levelFile: e.LOGLEVEL_FILE ? parseLoggerLevel(e.LOGLEVEL_FILE) : { level: 'error' },
  sendErrors: e.SEND_ERRORS ? parseBool(e.SEND_ERRORS) : false,
  errorLogUrl: e.ERROR_LOG_URL
    ? cleanUrl(e.ERROR_LOG_URL, 'http://localhost:2344/errorlog')
    : 'http://localhost:2344/errorlog',
  errorLogKey: e.ERROR_LOG_KEY ? e.ERROR_LOG_KEY : 'abc123',
  externalLog: {
    enabled: e.EXTERNAL_LOG ? parseBool(e.EXTERNAL_LOG) : false,
    depth: e.EXTERNAL_LOG_DEPTH ? parseLoggerDepth(e.EXTERNAL_LOG_DEPTH) : { depth: 'info' },
    url: e.EXTERNAL_LOG_URL
      ? cleanUrl(e.EXTERNAL_LOG_URL, 'http://localhost:2344/')
      : 'http://localhost:2344/',
    key: e.EXTERNAL_LOG_KEY ? e.EXTERNAL_LOG_KEY : 'testkey',
    identity: {
      anonymised: e.EXTERNAL_LOG_IDENTITY_ANONYMISED
        ? parseBool(e.EXTERNAL_LOG_IDENTITY_ANONYMISED)
        : false,
      sendOptions: e.EXTERNAL_LOG_IDENTITY_SEND_OPTIONS
        ? parseBool(e.EXTERNAL_LOG_IDENTITY_SEND_OPTIONS)
        : true,
      identifier: '',
      version: e.npm_package_version ? e.npm_package_version : '',
      environment: '',
      options: optionsConfig,
    },
  },
};

// Set the timezone for the application
e.TZ = optionsConfig.timezone;

export const configMessages: string[] = [];

// Validate an API key has been set
if (envConfig.apiKey === 'testkey') {
  configMessages.push('API key should be generated and set. Using default key: testkey');
}

// Validate cron if autoImport is set to true
if (
  optionsConfig.prismApi.importOptions.autoImport &&
  !cron.validate(optionsConfig.prismApi.importOptions.autoImportCron)
) {
  configMessages.push('Invalid auto import cron set, disabling auto import.');
  optionsConfig.prismApi.importOptions.autoImport = false;
}
