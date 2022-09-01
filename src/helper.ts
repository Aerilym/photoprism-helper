import { Request } from 'express';

import { AuthResponse, AuthValidation, ParseLoggerDepth, ParseLoggerLevel } from './types';

/**
 * Checks if a url is correctly formatted.
 *
 * @param url An input url to validate.
 * @returns Whether the url is valid or not.
 */
export function isUrl(url: string) {
  let urlObj;

  try {
    urlObj = new URL(url);
  } catch (_) {
    return false;
  }

  return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
}

/**
 * Attempts to parse a url into a valid url.
 *
 * @param url an input url to validate.
 * @param defaultUrl the default url to use if the input url is invalid.
 * @returns the input url if it is valid or made valid, otherwise the default url.
 */
export function cleanUrl(url: string, defaultUrl: string): string {
  if (url.slice(-1) != '/') {
    url += '/';
  }
  if (isUrl(url)) {
    return url;
  }
  return defaultUrl;
}

/**
 * Authenticates a request against the helper API.
 *
 * @param request The request to parse.
 * @param apiKey The api key to use for authentication.
 * @returns Whether the request passes authentication or not.
 */
export async function validateAuth(request: Request, apiKey: string): Promise<AuthValidation> {
  if (!request.headers) {
    return new AuthResponse(false, 'Request contained no header.');
  }
  if (!request.headers.authorization) {
    return new AuthResponse(false, 'Request contained no authorization header.');
  }
  const authHeader = request.headers.authorization.split(' ');
  if (authHeader.length !== 2 || authHeader[0] !== 'Bearer') {
    return new AuthResponse(false, 'Request authorization header incorrectly formatted.');
  }
  if (authHeader[1] !== apiKey) {
    return new AuthResponse(false, 'Invalid API Key');
  } else {
    return new AuthResponse(true, 'Authenticated');
  }
}

/**
 * Parses a user input into a boolean.
 *
 * @param value The value to parse.
 * @returns A boolean.
 */
export function parseBool(value: string | number): boolean {
  if (typeof value === 'string') {
    value = value.toLowerCase();
  }
  switch (value) {
    case 1:
      return true;
    case '1':
      return true;
    case 'true':
      return true;
    case 'yes':
      return true;
    case 'y':
      return true;
    default:
      return false;
  }
}

/**
 * Filters an object based on a filter object.
 *
 * @param mainObject The main object to filter.
 * @param filterObject The object to filter against.
 * @param allowEmpty Whether to allow empty returned objects or not.
 * @returns The filtered object.
 */
export function filterObject(mainObject: object, filterObject: object, allowEmpty: boolean) {
  const selectedItems = Object.keys(filterObject);

  let filteredObject = Object.keys(mainObject)
    .filter((key) => selectedItems.includes(key))
    .reduce((obj: object, key: string) => {
      obj[key as keyof typeof mainObject] = mainObject[key as keyof typeof mainObject];
      return obj;
    }, {});

  if (!allowEmpty && Object.keys(filteredObject).length < 1) {
    filteredObject = mainObject;
  }

  return filteredObject;
}

/**
 * Parses a given logger depth into a valid depth.
 *
 * @param depthString The depth to parse.
 * @returns The parsed depth.
 */
export function parseLoggerDepth(depthString: string): ParseLoggerDepth {
  switch (depthString) {
    case 'all':
      return { depth: 'all' };
    case 'error':
      return { depth: 'error' };
    case 'warn':
      return { depth: 'warn' };
    case 'info':
      return { depth: 'info' };
    case 'stats':
      return { depth: 'stats' };
    case 'none':
      return { depth: 'none' };
    default:
      return { depth: 'none', invalidDepth: true };
  }
}

/**
 * Parses a given logger level into a valid level.
 *
 * @param levelString The level to parse.
 * @returns The parsed level.
 */
export function parseLoggerLevel(levelString: string): ParseLoggerLevel {
  switch (levelString) {
    case 'error':
      return { level: 'error' };
    case 'warn':
      return { level: 'warn' };
    case 'info':
      return { level: 'info' };
    case 'http':
      return { level: 'http' };
    case 'verbose':
      return { level: 'verbose' };
    case 'debug':
      return { level: 'debug' };
    case 'silly':
      return { level: 'silly' };
    default:
      return { level: 'error', invalidLevel: true };
  }
}
