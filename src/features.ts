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
      { timeout: optionsConfig.prismApi.default.timeout }
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

/**
 * Makes a request to the PhotoPrism API to perform an action depending on
 * the called endpoint and body parameters.
 *
 * @param endpoint The endpoint to call
 * @param body The body to send to the endpoint
 * @param timeout The timeout to use for the request
 * @returns The outcome of the request
 */
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
      move: optionsConfig.prismApi.importOptions.move,
    },
    optionsConfig.prismApi.importOptions.timeout
  );
}

export async function prismIndex(): Promise<APIOutcome> {
  return prismApi(
    'index',
    {
      convert: true,
      path: '/',
      rescan: optionsConfig.prismApi.indexOptions.rescan,
      skipArchived: optionsConfig.prismApi.indexOptions.skipArchived,
    },
    optionsConfig.prismApi.indexOptions.timeout
  );
}
