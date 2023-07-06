import { v4 as uuidv4 } from 'uuid';

import { Message } from './index';
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

export function messageFactory(messageText: string, user: User, parentMessage: ParentMessage = null): Message {
  return {
    createdAt: Date.now(),
    hidePreview: false,
    id: uuidv4(),
    mentionedUserIds: [],
    message: messageText,
    isAdmin: false,
    parentMessageText: parentMessage ? parentMessage.message : '',
    sender: {
      userId: user.id,
      firstName: user.profileSummary.firstName,
      lastName: user.profileSummary.lastName,
      profileImage: user.profileSummary.profileImage,
      profileId: user.profileId,
    },
    updatedAt: 0,
    preview: null,
  };
}

export function extractLink(messageText: string): linkifyType[] {
  return linkifyjs.find(messageText);
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
