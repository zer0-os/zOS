import * as Request from 'superagent';
import { config } from '../../config';
import { isEmpty } from 'lodash';

interface RequestFilter {
  where?: any;
  limit?: number;
  order?: string;
  offset?: number;
  include?: any;
  [x: string]: any;
}

function apiUrl(path: string): string {
  return [
    config.ZERO_API_URL,
    path,
  ].join('');
}

const headers = new Headers();
/**
 * The zOS code now passes an 'x-app-platform' header to ensure that the
 * access_token cookie is unique for the scope of zos user.
 */
headers.set('X-APP-PLATFORM', 'zos');

/**
 * Vercel preview urls are on a different domain so we can't use cookie authentication.
 * Adding a workaround to use header based authentication for these requests when in preview mode.
 */
export const addVercelPreviewAuthHeader = (token: string) => {
  if (process.env.VERCEL_ENV === 'preview') {
    headers.set('Authorization', `Bearer ${token}`);
  }
};

export function get<T>(path: string, filter?: RequestFilter | string, query?: any) {
  let queryData;
  if (filter) {
    if (typeof filter === 'string') {
      queryData = { filter };
    } else {
      if (!isEmpty(filter)) {
        queryData = { filter: JSON.stringify(filter) };
      }
    }
  }

  if (query) {
    queryData = { ...queryData, ...query };
  }

  return Request.get<T>(apiUrl(path)).set(headers).withCredentials().query(queryData);
}

export function post<T>(path: string) {
  return Request.post<T>(apiUrl(path)).set(headers).withCredentials();
}

export function put<T>(path: string) {
  return Request.put<T>(apiUrl(path)).set(headers).withCredentials();
}

export function patch<T>(path: string) {
  return Request.patch<T>(apiUrl(path)).set(headers).withCredentials();
}

export function del<T>(path: string) {
  return Request.delete<T>(apiUrl(path)).set(headers).withCredentials();
}
