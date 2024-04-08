import { AuthorizationResponse, User } from './types';
import { del, get, post } from '../../lib/api/rest';

export async function nonceOrAuthorize(signedWeb3Token: string): Promise<AuthorizationResponse> {
  const response = await post('/authentication/nonceOrAuthorize').set('Authorization', `Web3 ${signedWeb3Token}`);

  return response.body;
}

export async function nonce(signedWeb3Token?: string): Promise<AuthorizationResponse> {
  if (signedWeb3Token) {
    const response = await post('/authentication/nonce').set('Authorization', `Web3 ${signedWeb3Token}`);

    return response.body;
  }

  const response = await post('/authentication/nonce');

  return response.body;
}

export async function fetchCurrentUser(): Promise<User> {
  try {
    const response = await get('/api/users/current');
    return response.body;
  } catch (error) {
    console.log(error);
  }

  return null;
}

export async function clearSession(): Promise<AuthorizationResponse> {
  const response = await del('/authentication/session');

  return response.body;
}

export async function getSSOToken(): Promise<{ token: string }> {
  const { body } = await get('/accounts/ssoToken');

  return body;
}

export async function emailLogin({ email, password }: { email: string; password: string }) {
  try {
    const response = await post('/api/v2/accounts/login').send({ email, password });
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return {
        success: false,
        response: error.response.body.code,
      };
    }
    throw error;
  }
}
