import { get } from '../../lib/api/rest';

export async function fetchChannels(id: string) {
  const channels = await get<any>(`/api/networks/${id}/chatChannels`);
  return await channels.body;
}
