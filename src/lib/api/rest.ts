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

function apiUrl(path: string) {
  return [
    config.ZERO_API_URL,
    path,
  ].join('');
}

export async function get<T>(path: string, filter?: RequestFilter) {
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

  const response = await Request.get<T>(apiUrl(path)).withCredentials().query(queryData);

  return response.body;
}

export async function post<T>(path: string, data: any = {}) {
  const response = await Request.post<T>(apiUrl(path)).withCredentials().send(data);

  return response.body;
}

export async function put<T>(path: string, data: any = {}) {
  const response = await Request.put<T>(apiUrl(path)).withCredentials().send(data);

  return response.body;
}
