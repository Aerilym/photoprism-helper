import { Request, Response } from 'express';
import { AxiosResponse } from 'axios';
import { APIOutcome, LibraryPage } from './types';
import { webPuppeteer } from './web';
import { photoPrism, config } from './api';
import { filterObject } from './helper';

export async function prismLibrary(page: 'import' | 'index'): Promise<APIOutcome> {
  const pageInfo: LibraryPage = {
    path: `library/${page}`,
    selector: {
      action: `button[class*="action-${page}"]`,
      successMessage: 'div[class="v-snack__wrapper success"]',
    },
  };
  let outcome = { code: 500, message: 'Unknown error' };
  await webPuppeteer.library(pageInfo).then((res) => {
    outcome = res;
  });
  return outcome;
}

export async function prismStats(req: Request, res: Response) {
  photoPrism
    .post('session', {
      username: config.user,
      password: config.pass,
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
