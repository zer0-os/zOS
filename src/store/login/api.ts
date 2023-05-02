import { post } from '../../lib/api/rest';

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
