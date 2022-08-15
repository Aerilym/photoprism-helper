import { Request } from 'express';
import { config } from './api';
import { AuthResponse, AuthValidation } from './types';

export function isUrl(url: string) {
  let urlObj;

  try {
    urlObj = new URL(url);
  } catch (_) {
    return false;
  }

  return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
}

export function cleanUrl(url: string): string {
  if (url.slice(-1) != '/') {
    url += '/';
  }
  if (isUrl(url)) {
    return url;
  }
  return 'http://localhost/';
}

export async function validateAuth(request: Request): Promise<AuthValidation> {
  try {
    if (!request.headers) {
      return new AuthResponse(false, 'Request contained no header.');
    } else if (!request.headers.authorization) {
      return new AuthResponse(false, 'Request contained no authorization header.');
    }
    const authHeader = request.headers.authorization.split(' ');
    if (authHeader.length > 2) {
      return new AuthResponse(false, 'Request authorization header incorrectly formatted.');
    } else if (authHeader[0] !== 'Bearer') {
      return new AuthResponse(false, 'Request authorization header incorrectly formatted.');
    }
    if (authHeader[1] !== config.apiKey) {
      return new AuthResponse(false, 'Invalid API Key');
    }
    return new AuthResponse(true, 'Authenticated');
  } catch (error: any) {
    console.log(error);
    return new AuthResponse(false, error.toString());
  }
}

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

export function filterObject(mainObject: {}, filterObject: {}, allowEmpty: boolean) {
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
