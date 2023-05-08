import { Message } from '../../store/messages';
import { ChatMember } from './types';

const DEFAULT_MEDIA_TYPE = 'image';

export const getChatMember = (sbMember: any): ChatMember => {
  let chatMember: ChatMember = {
    userId: sbMember.userId,
    firstName: sbMember.nickname,
    lastName: '',
    profileImage: sbMember.profileUrl,
    profileId: null,
  };
  // Some requests don't return the lastSeenAt value. If it's not valid
  // then don't set it here so that it doesn't override any existing state
  // later on
  if (sbMember.lastSeenAt && sbMember.lastSeenAt > 0) {
    chatMember.lastSeenAt = new Date(sbMember.lastSeenAt);
  }

  if (sbMember.connectionStatus === 'online') {
    chatMember.isOnline = true;
  }
  if (sbMember.connectionStatus === 'offline') {
    chatMember.isOnline = false;
  }

  try {
    const { profileImage, profileId, firstName, lastName } = JSON.parse(sbMember.profileUrl);
    chatMember = {
      ...chatMember,
      firstName,
      lastName,
      profileImage,
      profileId,
    };
  } catch (err) {}

  return chatMember;
};

function getSender(sendbirdUser) {
  if (sendbirdUser) {
    return getChatMember(sendbirdUser);
  }

  return null;
}

function isTypeValid(type) {
  return type === 'image' || type === 'video' || type === 'audio' || type === 'file';
}

// this is a result of bad data should we log?
function coerceType(type) {
  // check for video mime type
  if (type.indexOf('video') !== -1) {
    return 'video';
  }

  if (type.indexOf('audio') !== -1) {
    return 'audio';
  }

  if (type.indexOf('file') !== -1) {
    return 'file';
  }

  return DEFAULT_MEDIA_TYPE;
}

function getMediaWithType(data) {
  const media = {
    type: DEFAULT_MEDIA_TYPE,
    ...data,
  };

  if (!isTypeValid(media.type)) {
    media.type = coerceType(media.type);
  }

  return media;
}

function extractMessageData(jsonData, isMediaMessage) {
  let mentionedUsers = [];
  let hidePreview = false;
  let media;
  let admin;

  try {
    const data = jsonData ? JSON.parse(jsonData) : {};

    if (isMediaMessage) {
      media = getMediaWithType(data);
    }

    mentionedUsers = data.mentionedUsers || [];
    hidePreview = data.hidePreview || false;
    admin = data.admin || {};
  } catch (e) {}

  return { mentionedUsers, hidePreview, media, image: media, admin };
}

export function map(sendbirdMessage) {
  const { message, parentMessage, createdAt, messageId, sender, messageType, data, updatedAt } = sendbirdMessage;

  return {
    id: messageId,
    message,
    parentMessageText: parentMessage?.message,
    createdAt,
    updatedAt,
    sender: getSender(sender),
    ...extractMessageData(data, messageType.toLowerCase() === 'file'),
    isAdmin: messageType.toLowerCase() === 'admin',
  } as unknown as Message;
}
