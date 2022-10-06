import { get } from '../../lib/api/rest';

export async function searchMyNetworks(filter: string): Promise<any> {
  const response = await get<any>('/api/users/searchInNetworks', { filter });

  return response.body;
}
