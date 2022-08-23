import express from 'express';
import RateLimit from 'express-rate-limit';
import cron from 'node-cron';
import bodyParser from 'body-parser';

import { envConfig, optionsConfig } from './config';
import { validateAuth } from './helper';
import { prismLibrary, prismStats } from './features';
import { Requester } from './requester';
import { logger } from './logger';

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

let autoImportTask = cron.schedule(
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
    scheduled: false,
  }
);

let autoIndexTask = cron.schedule(
  optionsConfig.importOptions.autoImportCron,
  async () => {
    logger.info('Running auto index.');
    const importOutcome = await prismLibrary('index');
    logger.info(importOutcome.message);
  },
  {
    timezone: optionsConfig.timezone,
    scheduled: false,
  }
);

if (optionsConfig.importOptions.autoImport) {
  logger.info('Scheduling auto import task.');
  autoImportTask.start();
}

if (optionsConfig.importOptions.autoImport) {
  logger.info('Scheduling auto index task.');
  autoIndexTask.start();
}
