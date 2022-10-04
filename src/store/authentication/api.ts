import { AuthorizationResponse, User } from './types';
import { get, post } from '../../lib/api/rest';

export async function authorize(signedWeb3Token: string): Promise<AuthorizationResponse> {
  const response = await post('/authentication/authorize').set('Authorization', `Web3 ${signedWeb3Token}`);

  return response.body;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await get('/api/users/current').catch((err) => console.log(err));

  if (response) {
    return response.body;
  } else {
    return null;
  }
}
