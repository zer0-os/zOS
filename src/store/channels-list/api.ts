import { Channel } from './../channels/index';
import { get } from '../../lib/api/rest';

export async function fetchChannels(id: string) {
  const channels = await get<any>(`/api/networks/${id}/chatChannels`);
  return await channels.body;
}

export async function fetchDirectMessages(): Promise<Channel[]> {
  const directMessages = await get<Channel[]>('/directMessages/mine');
  return directMessages.body;
}
