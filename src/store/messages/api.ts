import { del, get, post, put, postNative } from '../../lib/api/rest';
import { infoUploadResponse, MessagesResponse } from './index';

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
  mentionedUserIds: string[]
): Promise<any> {
  const response = await post<any>(`/chatChannels/${channelId}/message`).send({ message, mentionedUserIds });

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
export async function getInfo(): Promise<infoUploadResponse> {
  const response = await get<any>('/upload/info');
  return response.body;
}

export async function uploadMedia(uploadInfo: infoUploadResponse, media: File): Promise<any> {
  const response = await postNative<any>(
    `${uploadInfo.apiUrl}?timestamp=${uploadInfo.query.timestamp}&signature=${uploadInfo.query.signature}&api_key=${uploadInfo.query.api_key}`
  ).attach('file', media);

  return response;
}

export async function uploadFileMessage(channelId: string, media: File): Promise<any> {
  const response = await postNative<any>(`/${channelId}/message`)
    .field({ message: '', mentionedUserIds: [] })
    .attach('file', media);

  return response;
}
