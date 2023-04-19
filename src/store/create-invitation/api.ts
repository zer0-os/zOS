import { post } from '../../lib/api/rest';

export async function getInvite() {
  const response = await post('/invite');
  return response.body;
}
