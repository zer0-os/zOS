import { post } from '../../lib/api/rest';

export async function requestPasswordReset({
  email,
}: {
  email: string;
}): Promise<{ success: boolean; response?: string }> {
  try {
    await post('/api/v2/accounts/request-password-reset').send({ email });
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
