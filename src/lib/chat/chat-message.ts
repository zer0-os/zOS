import { AdminMessageType, MediaType, Message, MessageSendStatus } from '../../store/messages';
import { RootState } from '../../store/reducer';
import { ChatMember } from './types';
import { denormalize as denormalizeUser } from '../../store/users';
import { currentUserSelector } from '../../store/authentication/saga';
import moment from 'moment';

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

  if (type.indexOf('file') !== -1 || type.indexOf('application/') !== -1 || type.indexOf('text/') !== -1) {
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
  let optimisticId = '';
  let rootMessageId = '';

  try {
    const data = jsonData ? JSON.parse(jsonData) : {};

    if (isMediaMessage) {
      media = getMediaWithType(data);
    }

    mentionedUsers = data.mentionedUsers || [];
    hidePreview = data.hidePreview || false;
    admin = data.admin || {};
    optimisticId = data.optimisticId || '';
    rootMessageId = data.rootMessageId || '';
  } catch (e) {}

  return {
    mentionedUsers,
    hidePreview,
    media,
    image: media?.type === 'image' ? media : undefined,
    admin,
    optimisticId,
    rootMessageId,
  };
}

export function map(sendbirdMessage) {
  if (!sendbirdMessage) {
    return null;
  }

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
    sendStatus: MessageSendStatus.SUCCESS,
    parentMessage: map(parentMessage),
  } as unknown as Message;
}

export function previewDisplayDate(timestamp: number) {
  if (!timestamp) {
    return '';
  }

  const messageDate = moment(timestamp);
  const currentDate = moment();

  if (messageDate.isSame(currentDate, 'day')) {
    return messageDate.format('h:mm A');
  } else if (messageDate.isAfter(currentDate.clone().subtract(7, 'days'), 'day')) {
    return messageDate.format('ddd');
  } else if (messageDate.year() === currentDate.year()) {
    return messageDate.format('MMM D');
  }

  return messageDate.format('MMM D, YYYY');
}

export function getMessagePreview(message: Message, state: RootState) {
  if (!message) {
    return '';
  }

  if (message.sendStatus === MessageSendStatus.FAILED) {
    return 'You: Failed to send';
  }

  if (message.isAdmin) {
    return adminMessageText(message, state);
  }

  let prefix = previewPrefix(message.sender, state);
  return `${prefix}: ${message.message || getMediaPreview(message)}`;
}

function previewPrefix(sender: Message['sender'], state: RootState) {
  const user = currentUserSelector()(state);
  return sender.userId === user.id ? 'You' : sender.firstName;
}

function getMediaPreview(message: Message) {
  switch (message?.media?.type) {
    case MediaType.Image:
      return 'sent an image';
    case MediaType.Video:
      return 'sent a video';
    case MediaType.File:
      return 'sent a file';
    case MediaType.Audio:
      return 'sent an audio message';
    default:
      return '';
  }
}

export function adminMessageText(message: Message, state: RootState) {
  const user = currentUserSelector()(state);

  let text = message.message;
  if (!message.admin) {
    return text;
  }

  switch (message.admin.type) {
    case AdminMessageType.JOINED_ZERO:
      return translateJoinedZero(message.admin, user, state) ?? text;
    case AdminMessageType.CONVERSATION_STARTED:
      return translateConversationStarted(message.admin, user, state) ?? text;
    case AdminMessageType.MEMBER_LEFT_CONVERSATION:
      return translateMemberLeftGroup(message.admin, state) ?? text;
    default:
      return text;
  }
}

function translateJoinedZero(admin: { inviteeId?: string; inviterId?: string }, currentUser, state: RootState) {
  const isCurrentUserInvitee = admin.inviteeId === currentUser.id;
  if (isCurrentUserInvitee) {
    const inviter = denormalizeUser(admin.inviterId, state);
    return inviter?.firstName ? `You joined ${inviter.firstName} on Zero` : null;
  }

  const invitee = denormalizeUser(admin.inviteeId, state);
  return invitee?.firstName ? `${invitee.firstName} joined you on Zero` : null;
}

function translateConversationStarted(admin: { creatorId?: string }, currentUser, state: RootState) {
  if (admin.creatorId === currentUser.id) {
    return 'You started the conversation';
  }

  const creator = denormalizeUser(admin.creatorId, state);
  return creator?.firstName ? `${creator.firstName} started the conversation` : null;
}

function translateMemberLeftGroup(admin: { creatorId?: string }, state: RootState) {
  const creator = denormalizeUser(admin.creatorId, state);
  return creator?.firstName ? `${creator.firstName} left the group` : null;
}
