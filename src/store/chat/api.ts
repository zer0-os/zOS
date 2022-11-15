import { ChatAccessTokenResponse } from './types';
import { get } from '../../lib/api/rest';

export async function fetchChatAccessToken(): Promise<ChatAccessTokenResponse> {
  const response = await get('/accounts/chatAccessToken').catch((err) => console.log(err));

  if (response) {
    return response.body;
  } else {
    return null;
  }
}
