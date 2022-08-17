import axios, { AxiosInstance } from 'axios';

import { envConfig, optionsConfig } from './config';
import { LoginCredentials } from './types';

export class Requester {
  constructor(credentials: LoginCredentials) {
    this.credentials = credentials;
    this.photoPrism = axios.create({
      baseURL: envConfig.baseUrl + 'api/v1/',
      timeout: 30000,
    });
  }
  credentials: LoginCredentials;
  photoPrism: AxiosInstance;
}
