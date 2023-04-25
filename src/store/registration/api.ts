import { InviteCodeStatus } from '.';
import { post } from '../../lib/api/rest';

export async function validateInvite({ code }: { code: string }): Promise<string> {
  try {
    await post(`/invite/${code}/validate`);
    return InviteCodeStatus.VALID;
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return error.response.body.code;
    }

    throw error;
  }
}

export async function createAccount({
  email,
  password,
  handle,
  inviteCode,
}: {
  email: string;
  password: string;
  handle: string;
  inviteCode: string;
}) {
  const user = { email, password, handle };
  try {
    const response = await post('/api/v2/accounts/createAndAuthorize').send({ user, inviteSlug: inviteCode });
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
  }
}

// XXX: Does this already exist, perhaps?
export async function updateProfile({ name }: { name: string }) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
}
