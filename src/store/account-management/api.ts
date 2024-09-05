import { post } from '../../lib/api/rest';

export async function linkNewWalletToZEROAccount(token) {
  try {
    const response = await post('/api/v2/accounts/add-wallet').send({ web3Token: token });
    return {
      success: true,
      response: response.body,
    };
  } catch (error: any) {
    if (error?.response?.status === 400) {
      return {
        success: false,
        response: error.response.body.code,
        error: error.response.body.message,
      };
    }
    throw error;
  }
}
