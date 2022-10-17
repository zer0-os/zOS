import { get } from '../../lib/api/rest';

export async function fetchChannels(id: string) {
  const channels = await get<any>(`/api/networks/${id}/chatChannels`);
  return await channels.body;
}

export async function fetchUsersByChannelId(channelId: string): Promise<any> {
  const response = await get<any>(`/chatChannels/${channelId}/members`);

  return response.body;
}
