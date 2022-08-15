import axios, { AxiosInstance } from 'axios';
import { config } from './api';
import { LoginCredentials } from './types';

export class Requester {
  constructor(credentials: LoginCredentials) {
    this.credentials = credentials;
    this.photoPrism = axios.create({
      baseURL: config.baseUrl + 'api/v1/',
      timeout: 30000,
    });
  }
  credentials: LoginCredentials;
  photoPrism: AxiosInstance;
}
