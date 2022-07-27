import { MessagesResponse } from './index';
import { config } from '../../config';

export async function fetchMessagesByChannelId(channelId: string): Promise<MessagesResponse> {
  const messagesResponse = await fetch(`${config.ZERO_API_URL}/chatChannels/${channelId}/messages`);
  const { messages } = await messagesResponse.json();

  return messages;
}
