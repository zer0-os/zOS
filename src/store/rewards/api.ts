import { get } from '../../lib/api/rest';

export async function fetchRewards(_obj: any) {
  const response = await get('/rewards/mine');
  return {
    success: true,
    response: response.body,
  };
}
