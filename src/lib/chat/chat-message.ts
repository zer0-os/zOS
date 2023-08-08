import { AdminMessageType, Message, MessageSendStatus } from '../../store/messages';
import { RootState } from '../../store/reducer';
import { ChatMember } from './types';
import { denormalize as denormalizeUser } from '../../store/users';
import { currentUserSelector } from '../../store/authentication/saga';

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

export function mapMatrixMessage(matrixMessage) {
  const parent = matrixMessage.content['m.relates_to'];

  return {
    id: matrixMessage.event_id,
    message: matrixMessage.content.body,
    parentMessageText: '',
    parentMessageId: parent ? parent['m.in_reply_to'].event_id : null,
    createdAt: matrixMessage.origin_server_ts,
    updatedAt: matrixMessage.origin_server_ts,
    sender: {},
    isAdmin: false,
    ...{ mentionedUsers: [], hidePreview: false, media: null, image: null, admin: {} },
  };
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
    sendStatus: MessageSendStatus.SUCCESS,
  } as unknown as Message;
}

export function adminMessageText(message: Message, state: RootState) {
  const user = currentUserSelector()(state);

  let text = message.message;
  if (!message.admin) {
    return text;
  }

  if (message.admin.type === AdminMessageType.JOINED_ZERO) {
    return translateJoinedZero(message.admin, user, state) ?? text;
  } else if (message.admin.type === AdminMessageType.CONVERSATION_STARTED) {
    return translateConversationStarted(message.admin, user, state) ?? text;
  }

  return text;
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
