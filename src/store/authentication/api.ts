import { AuthorizationResponse, User } from './types';
import { addVercelPreviewAuthHeader, del, get, post } from '../../lib/api/rest';
import * as Sentry from '@sentry/react';

export async function nonceOrAuthorize(signedWeb3Token: string): Promise<AuthorizationResponse> {
  const response = await post('/authentication/nonceOrAuthorize').set('Authorization', `Web3 ${signedWeb3Token}`);
  addVercelPreviewAuthHeader(response.body.accessToken);

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
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return null;
    }
    Sentry.captureException(error);
    throw error;
  }
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
    addVercelPreviewAuthHeader(response.body.accessToken);
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

export async function oauthLogin({ sessionToken }: { sessionToken: string }) {
  try {
    const response = await post('/api/oauth/establish-session').set('Authorization', `Bearer ${sessionToken}`).send();
    addVercelPreviewAuthHeader(response.body.accessToken);
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    return {
      success: false,
      response: error?.response?.body?.code,
    };
  }
}

export async function requestOTP({ email }: { email: string }) {
  try {
    const response = await post('/api/otp/request').send({ email });
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    return {
      success: false,
      response: error.response.body.code,
    };
  }
}

export async function verifyOTP({ email, code }: { email: string; code: string }) {
  try {
    const response = await post('/api/otp/verify').send({ email, code });
    addVercelPreviewAuthHeader(response.body.accessToken);
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    return {
      success: false,
      response: error.response.body.code,
    };
  }
}
