import { get } from '../../lib/api/rest';

export interface RewardsResp {
  success: boolean;
  response: {
    zero: string;
    zeroPreviousDay: string;
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
