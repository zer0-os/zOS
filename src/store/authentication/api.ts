import * as Request from 'superagent';

import { config } from '../../config';

interface AuthorizationResponse {
  accessToken: string;
}

export async function authorize(signedWeb3Token: string): Promise<AuthorizationResponse> {
  const response = await Request.post(`${config.ZERO_API_URL}/authentication/authorize`)
    .withCredentials()
    .set('Authorization', `Web3 ${signedWeb3Token}`);

  return response.body;
}
