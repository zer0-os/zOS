import * as Request from 'superagent';
import { MessagesResponse } from './index';
import { config } from '../../config';

export async function fetchMessagesByChannelId(channelId: string, lastCreatedAt?: number): Promise<MessagesResponse> {
  const filter = lastCreatedAt ? { lastCreatedAt } : {};

  const response = await Request.get(`${config.ZERO_API_URL}/chatChannels/${channelId}/messages`).query({ filter });

  return response.body;
}
