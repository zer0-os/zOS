import { config } from './../../config';
// import * as join from 'url-join';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';

// import auth from 'src/lib/auth';
// import * as config from '../config';
// import versionManager from './version-manager';

const HTTP_UNAUTHORIZED = 401;
const AUTHORIZATION_REQUIRED = 'AUTHORIZATION_REQUIRED';

let unauthenticatedRequestHandler = () => {
  return;
};

interface RequestFilter {
  where?: any;
  limit?: number;
  order?: string;
  offset?: number;
  include?: any;
  [x: string]: any;
}

async function request<T>(url: string, options: AxiosRequestConfig) {
  try {
    const result = await axios.request<T>({
      url,
      withCredentials: true,
      ...options,
    });

    // if ('x-app-version' in result.headers) {
    //   versionManager.receiveVersion(result.headers['x-app-version']);
    // }

    return result.data;
  } catch (err) {
    // const error: AxiosError = err;
    // if (error.response) {
    //   const errorResponse = error.response.data.error || error.response.data;
    //   if (error.response.status === HTTP_UNAUTHORIZED && errorResponse.code === AUTHORIZATION_REQUIRED) {
    //     await unauthenticatedRequestHandler();
    //     return;
    //   }
    // }
    // console.error(`Error detected during network request [${error.config.url}]`);
    // throw error;
  }
}

export async function get<T>(path: string, filter?: RequestFilter, query?: any) {
  let queryData;
  if (filter) {
    if (typeof filter === 'string') {
      queryData = { filter };
    } else {
      queryData = { filter: JSON.stringify(filter) };
    }
  }

  if (query) {
    queryData = { ...queryData, ...query };
  }

  return request<T>(config.ZERO_API_URL + path, {
    method: 'get',
    headers: {
      // Authorization: 'Bearer ' + (await auth.token()),
    },
    params: queryData,
  });
}

export function onUnauthenticatedRequest(callback: () => void) {
  unauthenticatedRequestHandler = callback;
}
