import { del, get, post, put } from '../../lib/api/rest';
import { ParentMessage } from '../../lib/chat/types';
import { LinkPreview } from '../../lib/link-preview';
import { Media, MessagesResponse } from './index';
import { SendPayload } from './saga';

export async function fetchMessagesByChannelId(channelId: string, lastCreatedAt?: number): Promise<MessagesResponse> {
  const filter: any = {};

  if (lastCreatedAt) {
    filter.lastCreatedAt = lastCreatedAt;
  }

  const response = await get<any>(`/chatChannels/${channelId}/messages`).send(filter);
  return response.body;
}

export async function sendMessagesByChannelId(
  channelId: string,
  message: string,
  mentionedUserIds: string[],
  parentMessage?: ParentMessage
): Promise<any> {
  const filter: SendPayload = { message, mentionedUserIds };
  if (parentMessage) {
    filter.parentMessageId = parentMessage.messageId;
    filter.parentMessageUserId = parentMessage.userId;
  }

  const response = await post<any>(`/chatChannels/${channelId}/message`).send(filter);

  return response;
}

export async function deleteMessageApi(channelId: string, messageId: number): Promise<number> {
  const response = await del<any>(`/chatChannels/${channelId}/message`).send({ message: { id: messageId } });

  return response.status;
}

export async function editMessageApi(
  channelId: string,
  messageId: number,
  message: string,
  mentionedUserIds: string[]
): Promise<number> {
  const response = await put<any>(`/chatChannels/${channelId}/message`).send({
    message: { id: messageId, message, mentionedUserIds },
  });

  return response.status;
}

export async function uploadFileMessage(channelId: string, media: File): Promise<Media> {
  const response = await post<any>(`/upload/chatChannels/${channelId}/message`).attach('file', media);

  return response.body;
}

export async function getLinkPreviews(link: string): Promise<LinkPreview> {
  const filter: any = { url: link };

  const response = await get<any>('/linkPreviews', filter);
  return response.body;
}
