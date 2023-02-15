import { Channel } from './../channels/index';
import { get, post } from '../../lib/api/rest';
import { DirectMessage } from './types';

export async function fetchChannels(id: string) {
  const channels = await get<any>(`/api/networks/${id}/chatChannels`);
  return await channels.body;
}

export async function fetchDirectMessages(): Promise<Channel[]> {
  const directMessages = await get<Channel[]>('/directMessages/mine');
  return directMessages.body;
}

export async function createDirectMessage(userIds: string[]): Promise<DirectMessage[]> {
  const directMessages = await post<Channel[]>('/directMessages').send({ userIds });
  return directMessages.body;
}
