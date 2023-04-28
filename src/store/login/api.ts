// import { patch, post } from '../../lib/api/rest';

export async function emailLogin({ email, password }: { email: string; password: string }) {
  console.log(email, password);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, response: {} };
}
