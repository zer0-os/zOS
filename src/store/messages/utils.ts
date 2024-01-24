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
  file?: { name: string; url: string; mediaType: MediaType },
  rootMessageId?: string
): Message {
  const id = uuidv4();
  let media;
  if (file) {
    media = {
      type: file.mediaType,
      url: file.url,
      name: file.name,
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
    sender: {
      userId: user.id,
      firstName: user.profileSummary.firstName,
      lastName: user.profileSummary.lastName,
      profileImage: user.profileSummary.profileImage,
      profileId: user.profileId,
      primaryZID: user.primaryZID,
    },
    updatedAt: 0,
    preview: null,
    media,
    sendStatus: MessageSendStatus.IN_PROGRESS,
  };
}

export function extractLink(messageText: string): linkifyType[] {
  return linkifyjs.find(messageText || '');
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
