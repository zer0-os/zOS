import { v4 as uuidv4 } from 'uuid';

import { MediaType, Message, MessageSendStatus } from './index';
import { User } from './../authentication/types';
import * as linkifyjs from 'linkifyjs';
import { ParentMessage } from '../../lib/chat/types';

export interface linkifyType {
  type: string;
  value: string;
  isLink: boolean;
  href: string;
  start: number;
  end: number;
}

export function createOptimisticMessageObject(
  messageText: string,
  user: User,
  parentMessage: ParentMessage = null,
  file?: { name: string; url: string; mediaType: MediaType; giphy: any; nativeFile: File },
  rootMessageId?: string
): Message {
  const id = uuidv4();
  let media;
  if (file) {
    media = {
      type: file.mediaType,
      url: file.giphy ? file.giphy.images.downsized.url : file.url,
      name: file.name,
      mimetype: file.giphy ? 'image/gif' : file.nativeFile ? file.nativeFile.type : null,
      // Not sure why these are in our types as I don't think we use them at all
      // I'm guessing this is for rendering a loaded message when the image hasn't downloaded yet
      // but we're not doing that yet.
      height: 0,
      width: 0,
    };
  }

  return {
    createdAt: Date.now(),
    hidePreview: false,
    id,
    optimisticId: id,
    rootMessageId,
    mentionedUsers: [],
    message: messageText,
    isAdmin: false,
    parentMessageText: parentMessage ? parentMessage.message : '',
    parentMessage,
    parentMessageMedia: parentMessage ? parentMessage.media : null,
    sender: {
      userId: user.id,
      matrixId: user.matrixId,
      firstName: user.profileSummary.firstName,
      lastName: user.profileSummary.lastName,
      profileImage: user.profileSummary.profileImage,
      profileId: user.profileId,
      primaryZID: user.primaryZID,
    },
    updatedAt: 0,
    media,
    sendStatus: MessageSendStatus.IN_PROGRESS,
    isPost: false,
  };
}

export function extractLink(messageText: string): linkifyType[] {
  return linkifyjs.find(messageText);
}

export function getFirstUrl(message: string) {
  const link: linkifyType[] = extractLink(message);
  if (!link.length) return;
  return link[0].href;
}

export const enum FileType {
  Media = 'media',
  Attachment = 'attachment',
}

export function getFileType(file: File) {
  const type = file.type;
  if (type.startsWith('image/') || type.startsWith('video/') || type.startsWith('audio/')) {
    return FileType.Media;
  }

  return FileType.Attachment;
}
