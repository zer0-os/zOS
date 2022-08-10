import * as Request from 'superagent';
import { MessagesResponse } from './index';
import { config } from '../../config';

export interface MessagesFilter {
  lastCreatedAt: number;
}

export async function fetchMessagesByChannelId(channelId: string, filter?: MessagesFilter): Promise<MessagesResponse> {
  const response = await Request.get(`${config.ZERO_API_URL}/chatChannels/${channelId}/messages`).query({
    filter: filter || {},
  });
  return response.body;
}
