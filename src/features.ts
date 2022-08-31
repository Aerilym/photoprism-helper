import { Request, Response } from 'express';
import { AxiosResponse } from 'axios';

import { envConfig, optionsConfig } from './config';
import { APIOutcome } from './types';
import { photoPrism } from './api';
import { filterObject } from './helper';
import { logger } from './logger';

export async function prismLogin(): Promise<string> {
  return await photoPrism
    .post(
      'session',
      {
        username: envConfig.user,
        password: envConfig.pass,
      },
      { timeout: 10000 }
    )
    .then((outcome: AxiosResponse) => {
      return outcome.data.id;
    })
    .catch((err) => {
      logger.error(err);
      return 'Invalid credentials';
    });
}

export async function prismStats(req: Request, res: Response) {
  photoPrism
    .post('session', {
      username: envConfig.user,
      password: envConfig.pass,
    })
    .then((outcome: AxiosResponse) => {
      let filteredBody = outcome.data;

      if (req.body) {
        filteredBody = filterObject(outcome.data, req.body, false);
      }

      return res.status(outcome.status).json(filteredBody);
    })
    .catch(function (error) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
    });
}

export async function prismApi(
  endpoint: string,
  body: object,
  timeout: number
): Promise<APIOutcome> {
  const sessionId = await prismLogin();
  if (sessionId === 'Invalid credentials') {
    logger.warn('Invalid PhotoPrism credentials provided!');
    return { code: 401, message: 'Invalid PhotoPrism credentials provided!' };
  }
  let outcome;
  try {
    outcome = await photoPrism.post(endpoint, body, {
      headers: {
        'X-Session-ID': sessionId,
      },
      timeout: timeout,
    });
  } catch (error) {
    logger.error(error);
    return { code: 500, message: 'Unknown error' };
  }

  return { code: outcome.status, message: outcome.data.message };
}

export async function prismImport(): Promise<APIOutcome> {
  return prismApi(
    'import',
    {
      path: '/',
      move: true,
    },
    optionsConfig.importOptions.successTimeout
  );
}

export async function prismIndex(): Promise<APIOutcome> {
  return prismApi(
    'index',
    {
      convert: true,
      path: '/',
      rescan: false,
      skipArchived: false,
    },
    300000
  );
}
