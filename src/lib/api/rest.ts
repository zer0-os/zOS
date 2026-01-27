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

export function apiUrl(path: string): string {
  return [
    config.ZERO_API_URL,
    path,
  ].join('');
}

export function billingApiUrl(path: string): string {
  return [config.BILLING_SERVICE_URL, path].join('');
}

/**
 * The zOS code now passes an 'x-app-platform' header to ensure that the
 * access_token cookie is unique for the scope of zos user.
 */
const platformHeader = { 'X-APP-PLATFORM': 'zos' };

/**
 * Vercel preview urls are on a different domain so we can't use cookie authentication.
 * Adding a workaround to use header based authentication for these requests when in preview mode.
 */
let authHeader = {};
export const addVercelPreviewAuthHeader = (token: string) => {
  if (process.env.VERCEL_ENV === 'preview') {
    authHeader = { Authorization: `Bearer ${token}` };
  }
};

if (localStorage.getItem('token')) {
  authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

// const t =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImpGTlhNbkZqR3JTb0RhZm5MUUJvaG9DTmFsV2NGY1RqbktFYmtSeldGQkh5WUpGaWtkTE1IUCJ9.eyJpYXQiOjE3NTc0NTgzMTMsImV4cCI6MTc4OTAxNTkxMywiaXNzIjoiaHR0cHM6Ly96b3NhcGkuemVyby50ZWNoIiwic3ViIjoiYXV0aDB8NjYzMjNhZGQyMTY3Zjg0NzEwNWYyNmI1IiwiYXVkIjpbImh0dHBzOi8vem9zYXBpLnplcm8udGVjaCJdLCJpZCI6IjkzZWU2YzZlLWNmNWEtNDRlYS05ZjI3LTdmMjljM2NjMjIxZCIsImh0dHA6Ly9mYWN0MHJ5LmNvbS9lbWFpbCI6InJhdGlrQHplcm8udGVjaCIsImF6cCI6Imh0dHBzOi8vem9zYXBpLnplcm8udGVjaCJ9.jga0HeFeRTaTm6_w8tobhql2QHEJcz2KjJGpc8jF5N4';
// if (t) {
//   authHeader = {
//     Authorization: `Bearer ${t}`,
//   };
// }

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

  return Request.get<T>(apiUrl(path)).set(authHeader).set(platformHeader).withCredentials().query(queryData);
}

export function post<T>(path: string) {
  return Request.post<T>(apiUrl(path)).set(authHeader).set(platformHeader).withCredentials();
}

export function put<T>(path: string) {
  return Request.put<T>(apiUrl(path)).set(authHeader).set(platformHeader).withCredentials();
}

export function patch<T>(path: string) {
  return Request.patch<T>(apiUrl(path)).set(authHeader).set(platformHeader).withCredentials();
}

export function del<T>(path: string) {
  return Request.delete<T>(apiUrl(path)).set(authHeader).set(platformHeader).withCredentials();
}

// Billing service API functions
export function billingGet<T>(path: string) {
  return Request.get<T>(billingApiUrl(path)).set(authHeader).withCredentials();
}

export function billingPost<T>(path: string) {
  return Request.post<T>(billingApiUrl(path)).set(authHeader).withCredentials();
}

export function billingDelete<T>(path: string) {
  return Request.delete<T>(billingApiUrl(path)).set(authHeader).withCredentials();
}
