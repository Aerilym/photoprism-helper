import dotenv from 'dotenv';
import express from 'express';
import RateLimit from 'express-rate-limit';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import { createLogger, transports, format } from 'winston';
import { cleanUrl, validateAuth, parseBool } from './helper';
import { EnvConfig, OptionsConfig } from './types';
import { prismLibrary, prismStats } from './features';
import { Requester } from './requester';

dotenv.config();

const logger = createLogger({
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
});

export const envConfig: EnvConfig = {
  baseUrl: process.env.PHOTOPRISM_SITE_URL
    ? cleanUrl(process.env.PHOTOPRISM_SITE_URL)
    : 'http://localhost:2342/',
  hostPort: process.env.HOSTPORT ? parseInt(process.env.HOSTPORT) : 2343,
  user: process.env.PHOTOPRISM_USERNAME ? process.env.PHOTOPRISM_USERNAME : 'admin',
  pass: process.env.PHOTOPRISM_PASSWORD ? process.env.PHOTOPRISM_PASSWORD : '',
  apiKey: process.env.APIKEY ? process.env.APIKEY : 'testkey',
};

export const optionsConfig: OptionsConfig = {
  isDocker: process.env.ISDOCKER ? parseBool(process.env.ISDOCKER) : false,
  timezone: process.env.TIMEZONE ? process.env.TIMEZONE : 'Australia/Melbourne',
  importOptions: {
    successTimeout: process.env.IMPORT_TIMEOUT ? parseInt(process.env.IMPORT_TIMEOUT) : 300000,
    autoImport: process.env.AUTO_IMPORT ? parseBool(process.env.AUTO_IMPORT) : false,
    autoImportCron: process.env.AUTO_IMPORT_CRON ? process.env.AUTO_IMPORT_CRON : '0 0 5 * * * *',
    indexAfterAutoImport: process.env.INDEX_AFTER_AUTO_IMPORT
      ? parseBool(process.env.INDEX_AFTER_AUTO_IMPORT)
      : false,
  },
};

if (envConfig.apiKey === 'testkey') {
  logger.warn(`An API key should be generated and set in env var APIKEY`);
}

if (optionsConfig.isDocker) {
  logger.warn(
    `Env var ISDOCKER is set to ${optionsConfig.isDocker}. If the application is not running in a docker container change this to false.`
  );
}

if (
  optionsConfig.importOptions.autoImport &&
  !cron.validate(optionsConfig.importOptions.autoImportCron)
) {
  logger.warn('Invalid auto import cron set, disabling auto import.');
  optionsConfig.importOptions.autoImport = false;
}

logger.info(`Targeting PhotoPrism instance at ${envConfig.baseUrl}`);

const api = express();
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());
api.use(bodyParser.raw());

//  Rate limit requests to the API
const limiter = RateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

api.use(limiter);

export const photoPrism = new Requester({
  username: envConfig.user,
  password: envConfig.pass,
}).photoPrism;

api.use(function (req, res, next) {
  validateAuth(req, envConfig.apiKey).then((authOutcome) => {
    if (!authOutcome.success) {
      return res.status(403).json({ error: authOutcome.message });
    }
    next();
  });
});

/**
 * Initiates the import feature of PhotoPrism
 */
api.post('/import', async (req, res) => {
  const outcome = await prismLibrary('import');
  logger.info(outcome.message);
  return res.status(outcome.code).json({ message: outcome.message });
});

/**
 * Initiates the index feature of PhotoPrism
 */
api.post('/index', async (req, res) => {
  const outcome = await prismLibrary('index');
  logger.info(outcome.message);
  return res.status(outcome.code).json({ message: outcome.message });
});

api.get('/stats', (req, res) => {
  return prismStats(req, res);
});

api.listen(envConfig.hostPort, () => {
  logger.info(`PhotoPrism Helper API listening on port ${envConfig.hostPort}`);
});

if (optionsConfig.importOptions.autoImport) {
  cron.schedule(
    optionsConfig.importOptions.autoImportCron,
    async () => {
      logger.info('Running auto import.');
      const importOutcome = await prismLibrary('import');
      logger.info(importOutcome.message);
      if (optionsConfig.importOptions.indexAfterAutoImport) {
        const indexOutcome = await prismLibrary('index');
        logger.info(indexOutcome.message);
      }
    },
    {
      timezone: optionsConfig.timezone,
    }
  );
}
