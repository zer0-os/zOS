import { get } from '../../lib/api/rest';

export async function searchMyNetworks(channelId: string): Promise<any> {
  const response = await get<any>(`/chatChannels/${channelId}/members`);

  return response.body;
}
