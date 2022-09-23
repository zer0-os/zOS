import * as Request from 'superagent';
import { MessagesResponse } from './index';
import { config } from '../../config';

export async function fetchMessagesByChannelId(channelId: string, lastCreatedAt?: number): Promise<MessagesResponse> {
  const filter = lastCreatedAt ? { lastCreatedAt } : {};

  const response = await Request.get(`${config.ZERO_API_URL}/chatChannels/${channelId}/messages`).query({
    filter: JSON.stringify(filter),
  });

  return response.body;
}

export async function sendMessagesByChannelId(
  channelId: string,
  message: string,
  mentionedUser: string
): Promise<boolean> {
  const response = await Request.post(`${config.ZERO_API_URL}/chatChannels/${channelId}/message`).send({
    message,
    mentionedUsers: [mentionedUser],
  });

  return response.body;
}
