import { Channel } from './../channels/index';
import { get, post } from '../../lib/api/rest';
import { DirectMessage } from './types';

export async function fetchChannels(id: string) {
  const channels = await get<any>(`/api/networks/${id}/chatChannels`);
  return await channels.body;
}

export async function fetchConversations(): Promise<Channel[]> {
  const directMessages = await get<Channel[]>('/directMessages/mine');
  return directMessages.body;
}

export async function createConversation(userIds: string[]): Promise<DirectMessage[]> {
  const directMessages = await post<Channel[]>('/directMessages').send({ userIds });
  return directMessages.body;
}

export async function fetchConversationsWithUsers(_userIds: string[]): Promise<any[]> {
  // Simulate request timing
  await new Promise((r) => setTimeout(r, 30));
  return [];
  // const response = await get<Channel[]>('/conversations', { userIds });
  // return response.body;
}
