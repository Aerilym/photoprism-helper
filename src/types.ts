export type urlStyle = 'base' | 'path';

export interface APIOutcome {
  code: number;
  message: string;
}

export class Outcome implements APIOutcome {
  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }
  code: number;
  message: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export class Credentials implements LoginCredentials {
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
  username: string;
  password: string;
}

export interface EnvConfig {
  baseUrl: string;
  hostPort: number;
  user: string;
  pass: string;
  apiKey: string;
  isDocker: boolean;
  timezone: string;
  importOptions: {
    successTimeout: number;
    autoImport: boolean;
    autoImportCron: string;
    indexAfterAutoImport: boolean;
  };
}

export interface LibraryPage {
  path: string;
  selector: {
    action: string;
    successMessage: string;
  };
}

export interface PrismStats {
  originals: number;
}

export interface AuthValidation {
  success: boolean;
  message: string;
}

export class AuthResponse implements AuthValidation {
  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
  success: boolean;
  message: string;
}
