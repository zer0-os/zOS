import { get } from '../../lib/api/rest';
import { Channel } from '../channels';
import { DirectMessage } from './types';

export async function fetchDirectMessages(): Promise<DirectMessage[]> {
  const directMessages = await get<Channel[]>('/directMessages/mine');
  return await directMessages.body;
}
