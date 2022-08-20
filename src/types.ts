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
}

export interface OptionsConfig {
  isDocker: boolean;
  timezone: string;
  logFilePath: string;
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

export type LoggerDepth = 'all' | 'error' | 'warn' | 'info' | 'stats' | 'none';
export type LoggerLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

export interface ParseLoggerDepth {
  depth: LoggerDepth;
  invalidDepth?: boolean;
}

export interface ParseLoggerLevel {
  level: LoggerLevel;
  invalidLevel?: boolean;
}

export interface LoggerConfig {
  file: string;
  levelConsole: ParseLoggerLevel;
  levelFile: ParseLoggerLevel;
  sendErrors: boolean;
  errorLogUrl: string;
  errorLogKey: string;
  externalLog: {
    enabled: boolean;
    depth: ParseLoggerDepth;
    url: string;
    key: string;
    identity: {
      anonymised: boolean;
      sendOptions: boolean;
      identifier: string;
      version: string;
      environment: string;
      options: OptionsConfig;
    };
  };
}
