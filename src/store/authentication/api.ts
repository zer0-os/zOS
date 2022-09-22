import { AuthorizationResponse, User } from './types';
import * as Request from 'superagent';

import { config } from '../../config';

export async function authorize(signedWeb3Token: string): Promise<AuthorizationResponse> {
  const response = await Request.post(`${config.ZERO_API_URL}/authentication/authorize`)
    .withCredentials()
    .set('Authorization', `Web3 ${signedWeb3Token}`);

  return response.body;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await Request.get(`${config.ZERO_API_URL}/api/users/current`)
    .withCredentials()
    .catch((err) => console.log(err));

  if (response) {
    return response.body;
  } else {
    return null;
  }
}
