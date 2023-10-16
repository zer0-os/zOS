import { AttachmentResponse } from '../../lib/api/attachment';
import { get, post } from '../../lib/api/rest';
import { ParentMessage } from '../../lib/chat/types';
import { LinkPreview } from '../../lib/link-preview';
import { AttachmentUploadResult } from './index';
import { FileUploadResult, SendPayload } from './saga';

import axios from 'axios';

export async function sendFileMessage(channelId: string, file: FileUploadResult, optimisticId?: string): Promise<any> {
  return sendMessagesByChannelId(channelId, null, null, null, file, optimisticId);
}

export async function sendMessagesByChannelId(
  channelId: string,
  message: string,
  mentionedUserIds: string[],
  parentMessage?: ParentMessage,
  file?: FileUploadResult,
  optimisticId?: string
): Promise<any> {
  const data: SendPayload = { message, mentionedUserIds, optimisticId };

  if (parentMessage) {
    data.parentMessageId = parentMessage.messageId;
    data.parentMessageUserId = parentMessage.userId;
  }

  if (file) {
    data.file = file;
  }

  const response = await post<any>(`/chatChannels/${channelId}/message`).send(data);

  return response.body;
}

export async function uploadFileMessage(channelId: string, media: File, rootMessageId: string = '', optimisticId = '') {
  const response = await post<any>(`/upload/chatChannels/${channelId}/message`)
    .field('rootMessageId', rootMessageId)
    .field('optimisticId', optimisticId)
    .attach('file', media);

  return response.body;
}

export async function uploadAttachment(file: File): Promise<AttachmentUploadResult> {
  const response = await get<any>('/api/feedItems/getAttachmentUploadInfo', undefined, {
    name: file.name,
    type: file.type,
  });
  const uploadInfo: AttachmentResponse = response.body;

  await axios.put(uploadInfo.signedUrl, file, {
    timeout: 2 * 60 * 1000,
    headers: {
      'Content-Type': file.type,
    },
    // note: for adding progress bar to the upload
    // https://github.com/m3m3n70/zero-web/blob/development/src/app/api/file/index.ts#L110
    onUploadProgress: (_event) => {},
  });

  return {
    name: file.name,
    key: uploadInfo.key,
    url: uploadInfo.key,
    type: 'file',
  };
}

export async function getLinkPreviews(link: string): Promise<LinkPreview> {
  const filter: any = { url: link };

  const response = await get<any>('/linkPreviews', filter);
  return response.body;
}
