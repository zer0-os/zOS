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
  nonceToken,
}: {
  email: string;
  password: string;
  handle: string;
  inviteCode: string;
  nonceToken: string;
}) {
  const user = { email, password, handle };
  try {
    const response = await post('/api/v2/accounts/createAndAuthorize')
      .set('Authorization', `Nonce ${nonceToken}`)
      .send({ user, inviteSlug: inviteCode });
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

export async function addEmailAccount({ email, password }: { email: string; password: string }) {
  const user = { email, password };
  try {
    const response = await post('/api/v2/accounts/add-email').send(user);
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

export async function createWeb3Account({ inviteCode, web3Token }: { inviteCode: string; web3Token: string }) {
  try {
    const response = await post('/api/v2/accounts/createAndAuthorize')
      .set('Authorization', `Web3 ${web3Token}`)
      .send({ inviteSlug: inviteCode });
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

export async function completeAccount({
  userId,
  name,
  inviteCode,
  profileImage,
}: {
  userId: string;
  name: string;
  inviteCode: string;
  profileImage?: string;
}) {
  try {
    const response = await post('/api/v2/accounts/finalize').send({
      userId,
      inviteCode,
      name,
      profileImage,
    });
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
