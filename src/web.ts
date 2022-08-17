import puppeteer from 'puppeteer';
import { envConfig, optionsConfig } from './api';
import { LibraryPage, APIOutcome, Credentials, Outcome } from './types';

class WebPuppeteer {
  constructor() {}

  async login(page: puppeteer.Page, path: string, credentials: Credentials) {
    const navUrl = (await envConfig.baseUrl) + path;

    await page.goto(navUrl, { waitUntil: 'networkidle0' });
    await page.type('input[aria-label="Name"]', credentials.username);
    await page.type('input[aria-label="Password"]', credentials.password);
    await Promise.all([
      page.click('button[class*="action-confirm"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
  }

  async library(pageInfo: LibraryPage): Promise<APIOutcome> {
    let browserParams: object = {
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    };
    if (optionsConfig.isDocker) {
      browserParams = { ...browserParams, executablePath: '/usr/bin/chromium-browser' };
    }
    const browser = await puppeteer.launch(browserParams);
    const page = await browser.newPage();
    const credentials = new Credentials(envConfig.user, envConfig.pass);

    await this.login(page, pageInfo.path, credentials);

    await Promise.all([page.click(pageInfo.selector.action)]);

    try {
      const infobox = await page.waitForSelector(pageInfo.selector.successMessage, {
        timeout: optionsConfig.importOptions.successTimeout,
      });
      if (infobox) {
        const value: string = await infobox.evaluate(
          (el: { textContent: string }) => el.textContent
        );
        return new Outcome(200, `PhotoPrism ${value.replace(' close', '')}`);
      } else {
        return new Outcome(200, 'Success message not found in the timeout time.');
      }
    } catch (err) {
      if (err instanceof puppeteer.errors.TimeoutError) {
        return new Outcome(500, err.message);
      } else {
        return new Outcome(500, 'An unknown internal error occured.');
      }
    }
  }
}

export const webPuppeteer = new WebPuppeteer();
