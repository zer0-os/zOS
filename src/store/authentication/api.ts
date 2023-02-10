import { AuthorizationResponse, Member, User } from './types';
import { del, get, post } from '../../lib/api/rest';

export async function nonceOrAuthorize(signedWeb3Token: string): Promise<AuthorizationResponse> {
  const response = await post('/authentication/nonceOrAuthorize').set('Authorization', `Web3 ${signedWeb3Token}`);

  return response.body;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await get('/api/users/current').catch((err) => console.log(err));

  if (response) {
    return response.body;
  } else {
    return null;
  }
}

export async function searchMyNetworksByName(filter: string): Promise<Member[]> {
  return await get('/api/users/searchInNetworksByName', { filter })
    .catch((_error) => null)
    .then((response) => response?.body || []);
}

export async function clearSession(): Promise<AuthorizationResponse> {
  const response = await del('/authentication/session');

  return response.body;
}

export async function createAndAuthorize(
  nonce: string,
  user: object,
  inviteCode: string
): Promise<AuthorizationResponse> {
  return await post('/accounts/createAndAuthorize').set('Authorization', `Nonce ${nonce}`).send({ user, inviteCode });
}

export async function updateImageProfile(profileId: string, profileImage: File): Promise<AuthorizationResponse> {
  return await post(`/upload/avatar?profileId=${profileId}`).attach('file', profileImage);
}
