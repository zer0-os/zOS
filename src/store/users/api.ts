import { get } from '../../lib/api/rest';
import { MemberNetworks } from './types';

export async function searchMyNetworksByName(filter: string): Promise<MemberNetworks[]> {
  return await get('/api/v2/users/searchInNetworksByName', { filter })
    .catch((_error) => null)
    .then((response) => response?.body || []);
}
