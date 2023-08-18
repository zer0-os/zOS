import { post } from '../../lib/api/rest';

export async function confirmPasswordReset({
  token,
  password,
}: {
  token: string;
  password: string;
}): Promise<{ success: boolean; response?: string }> {
  try {
    await post('/api/v2/accounts/set-password').send({ token, password });

    return {
      success: true,
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
