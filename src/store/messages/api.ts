import { get, post } from '../../lib/api/rest';
import { MessagesResponse } from './index';

export async function fetchMessagesByChannelId(channelId: string, lastCreatedAt?: number): Promise<MessagesResponse> {
  const filter: any = {};

  if (lastCreatedAt) {
    filter.lastCreatedAt = lastCreatedAt;
  }

  return await get<any>(`/chatChannels/${channelId}/messages`, filter);
}

export async function sendMessagesByChannelId(channelId: string, message: string): Promise<any> {
  return await post<any>(`/chatChannels/${channelId}/message`, { message });
}
