import { get } from '../../lib/api/rest';
import { MemberNetworks } from './types';

export async function searchMyNetworksByName(filter: string): Promise<MemberNetworks[]> {
  return await get('/api/users/searchInNetworksByName', { filter })
    .catch((_error) => null)
    .then((response) => response?.body || []);
}

export async function searchAllUsers(filter: string): Promise<MemberNetworks[]> {
  return await get('/api/search/all', { filter })
    .catch((_error) => null)
    .then((response) => response?.body || []);
}
