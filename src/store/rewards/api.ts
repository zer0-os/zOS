import { get } from '../../lib/api/rest';

export async function fetchRewards(_obj: any) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const response = await get('/rewards/mine');
  return {
    success: true,
    response: response.body,
  };
}
