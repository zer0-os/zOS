import { patch } from '../../lib/api/rest';

export async function confirmPasswordReset({
  token,
  password,
}: {
  token: string;
  password: string;
}): Promise<{ success: boolean; response?: string }> {
  try {
    await patch('/api/v2/users/set-password').send({ token, password });

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
