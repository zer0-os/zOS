import * as Request from 'superagent';
import { config } from '../../config';
import { isEmpty } from 'lodash';

interface RequestFilter {
  where?: any;
  limit?: number;
  order?: string;
  offset?: number;
  include?: any;
}

function apiUrl(path: string): string {
  return [
    config.ZERO_API_URL,
    path,
  ].join('');
}

export function get<T>(path: string, filter?: RequestFilter) {
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

  return Request.get<T>(apiUrl(path)).withCredentials().query(queryData);
}

export function post<T>(path: string) {
  return Request.post<T>(apiUrl(path)).withCredentials();
}

export async function put<T>(path: string, data: any = {}) {
  const response = await Request.put<T>(apiUrl(path)).withCredentials().send(data);

  return response.body;
}
