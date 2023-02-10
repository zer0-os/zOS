import { get, post } from '../../lib/api/rest';
import { Channel } from '../channels';
import { DirectMessage } from './types';

export async function fetchDirectMessages(): Promise<DirectMessage[]> {
  const directMessages = await get<Channel[]>('/directMessages/mine');
  return directMessages.body;
}

export async function createDirectMessage(userIds: string[]): Promise<DirectMessage[]> {
  const directMessages = await post<Channel[]>('/directMessages').send(userIds);
  return directMessages.body;
}
