import { post } from '../../lib/api/rest';

export async function resetPassword({ email }: { email: string }) {
  try {
    await post('/api/v2/accounts/reset-password').send({ email });
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
