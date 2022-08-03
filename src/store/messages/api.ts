import { MessagesResponse } from './index';
import { config } from '../../config';

export interface MessagesFilter {
  lastCreatedAt: string;
}

export async function fetchMessagesByChannelId(channelId: string, filter?: MessagesFilter): Promise<MessagesResponse> {
  const queryParams = JSON.stringify(filter || {});
  const messagesResponse = await fetch(
    `${config.ZERO_API_URL}/chatChannels/${channelId}/messages?filter=${encodeURIComponent(queryParams)}`
  );
  return await messagesResponse.json();
}
