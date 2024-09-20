import { get, post } from '../../lib/api/rest';

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
    const response = await post('/rewards/transfer').send({
      senderUserId,
      recipientUserId,
      amount,
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
