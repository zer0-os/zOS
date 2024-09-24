import { get, post } from '../../lib/api/rest';
import BN from 'bn.js';

export interface RewardsResp {
  success: boolean;
  response: {
    meow: string;
    meowPreviousDay: string;
    decimals: number;
  };
}

export async function fetchRewards(_obj: any): Promise<RewardsResp> {
  const response = await get('/rewards/mine');
  return {
    success: true,
    response: response.body,
  };
}

export async function fetchCurrentMeowPriceInUSD() {
  const response = await get('/api/tokens/meow');
  return {
    success: true,
    response: response.body,
  };
}

export async function transferMeow(senderUserId: string, recipientUserId: string, amount: string) {
  try {
    const amountInWei = new BN(amount).mul(new BN('1000000000000000000')).toString();

    const response = await post('/rewards/transfer').send({
      senderUserId,
      recipientUserId,
      amount: amountInWei,
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
        error: error.response.body.message,
      };
    }
    throw error;
  }
}
