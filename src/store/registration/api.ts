//import { post } from '../../lib/api/rest';

export async function validateInvite({ code }: { code: string }) {
  //const response = await post(`/invite/${code}/validate`);
  console.log('code', code);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
}
