import { CustomEventType, MatrixConstants, MembershipStateType, NotifiableEventType } from './types';
import { EventType, MsgType, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';
import { AdminMessageType, Message, MessageSendStatus } from '../../../store/messages';
import { getObjectDiff, parsePlainBody } from './utils';
import { PowerLevels } from '../types';

async function parseMediaData(matrixMessage) {
  const { content } = matrixMessage;

  let media = null;
  try {
    if (content?.msgtype === MsgType.Image) {
      media = await buildMediaObject(content);
    }
  } catch (e) {
    console.error('error ocurred while parsing media data: ', e);
  }

  return {
    media,
    image: content?.msgtype === MsgType.Image ? media : undefined,
    rootMessageId: media?.rootMessageId || '',
  };
}

async function buildMediaObject(content) {
  if (content.file && content.info) {
    return {
      url: null,
      type: 'image',
      file: { ...content.file },
      ...content.info,
    };
  } else if (content.url) {
    return {
      url: content.url,
      type: 'image',
      ...content.info,
    };
  }
  return null;
}

export async function mapMatrixMessage(matrixMessage, sdkMatrixClient: SDKMatrixClient) {
  const { event_id, content, origin_server_ts, sender: senderId, updatedAt } = matrixMessage;

  const parent = matrixMessage.content['m.relates_to'];
  const senderData = sdkMatrixClient.getUser(senderId);

  let messageContent = content.body;
  if (parent && parent['m.in_reply_to']) {
    messageContent = parsePlainBody(content.body);
  }

  return {
    id: event_id,
    message: content.msgtype === 'm.image' ? '' : messageContent,
    createdAt: origin_server_ts,
    updatedAt: updatedAt,
    sender: {
      userId: senderId,
      firstName: senderData?.displayName,
      lastName: '',
      profileImage: '',
      profileId: '',
    },
    isAdmin: false,
    optimisticId: content.optimisticId,
    ...{
      admin: {},
      mentionedUsers: [],
      hidePreview: false,
      media: null,
      image: null,
    },
    parentMessageText: '',
    parentMessageMedia: null,
    parentMessageId: parent ? parent['m.in_reply_to']?.event_id : null,
    isHidden: content?.msgtype === MatrixConstants.BAD_ENCRYPTED_MSGTYPE,
    ...(await parseMediaData(matrixMessage)),
  };
}

export function mapEventToAdminMessage(matrixMessage): Message {
  const { event_id, content, origin_server_ts, sender, type, state_key: targetUserId, unsigned } = matrixMessage;

  const adminData = getAdminDataFromEventType(type, content, sender, targetUserId, unsigned?.prev_content);

  if (!adminData) {
    return null;
  }

  return {
    id: event_id,
    message: 'Conversation was started',
    createdAt: origin_server_ts,
    isAdmin: true,
    admin: adminData,

    updatedAt: 0,
    sender: ADMIN_USER,
    mentionedUsers: [],
    hidePreview: false,
    preview: null,
    sendStatus: MessageSendStatus.SUCCESS,
    isPost: false,
  };
}

export async function mapEventToPostMessage(matrixMessage, sdkMatrixClient: SDKMatrixClient) {
  const { event_id, content, origin_server_ts, sender: senderId } = matrixMessage;

  const senderData = sdkMatrixClient.getUser(senderId);
  const { media, image, rootMessageId } = await parseMediaData(matrixMessage);

  return {
    id: event_id,
    message: content.body,
    createdAt: origin_server_ts,
    updatedAt: 0,
    optimisticId: content.optimisticId,

    sender: {
      userId: senderId,
      firstName: senderData?.displayName,
      lastName: '',
      profileImage: '',
      profileId: '',
      displaySubHandle: '',
    },

    isAdmin: false,
    mentionedUsers: [],
    hidePreview: false,
    preview: null,
    sendStatus: MessageSendStatus.SUCCESS,
    isPost: true,
    media,
    image,
    rootMessageId,
    reactions: {},
  };
}

export async function mapEventToNotification(event) {
  const { event_id, room_id, origin_server_ts, sender, content, type } = event;

  const baseNotification = {
    id: event_id,
    roomId: room_id,
    createdAt: origin_server_ts,
    sender: {
      userId: sender,
    },
  };

  if (type === 'm.room.message' && content?.body) {
    const mentions = content.body ? extractMentionsFromBody(content.body) : [];
    if (mentions.length > 0) {
      return {
        ...baseNotification,
        type: 'mention',
        content: {
          body: content.body,
          mentions,
          notificationType: 'mention',
        },
      };
    }
  }

  if (type === MatrixConstants.REACTION && !event?.unsigned?.redacted_because) {
    const isMeowReaction = content['m.relates_to'].key.startsWith('MEOW_');
    if (isMeowReaction) {
      return null;
    }

    return {
      ...baseNotification,
      type: 'reaction',
      content: {
        reactionKey: content['m.relates_to'].key,
        targetEventId: content['m.relates_to'].event_id,
      },
    };
  }

  if (content['m.relates_to']?.['m.in_reply_to']) {
    return {
      ...baseNotification,
      type: 'reply',
      content: {
        body: content.body,
        replyToEventId: content['m.relates_to']['m.in_reply_to'].event_id,
        notificationType: 'reply',
      },
    };
  }

  if (type === 'm.room.message') {
    return {
      ...baseNotification,
      type: 'direct_message',
      content: {
        body: content.body,
        notificationType: 'direct_message',
      },
    };
  }

  return null;
}

function extractMentionsFromBody(body: string) {
  const mentionRegex = /@\[.*?\]\(user:(.*?)\)/g;
  const matches = [...body?.matchAll(mentionRegex)];
  return matches.map((match) => match[1]);
}

function getAdminDataFromEventType(type, content, sender, targetUserId, previousContent) {
  switch (type) {
    case EventType.RoomMember:
      return getRoomMemberAdminData(content, targetUserId, previousContent);
    case EventType.RoomCreate:
      return { type: AdminMessageType.CONVERSATION_STARTED, userId: sender };
    case EventType.RoomPowerLevels:
      return getRoomPowerLevelsChangedAdminData(content, previousContent);
    case EventType.Reaction:
      return getRoomReactionAdminData(content, sender);
    default:
      return null;
  }
}

function getRoomReactionAdminData(content, sender) {
  return { type: AdminMessageType.REACTION, userId: sender, amount: content.amount };
}

function getRoomMemberAdminData(content, targetUserId, previousContent?) {
  if (previousContent?.avatar_url !== content.avatar_url) {
    return { type: AdminMessageType.MEMBER_AVATAR_CHANGED, userId: targetUserId };
  }

  switch (content.membership) {
    case MembershipStateType.Leave:
      return { type: AdminMessageType.MEMBER_LEFT_CONVERSATION, userId: targetUserId };
    case MembershipStateType.Invite:
      return { type: AdminMessageType.MEMBER_ADDED_TO_CONVERSATION, userId: targetUserId };
    default:
      return null;
  }
}

export function getRoomPowerLevelsChangedAdminData(content, previousContent) {
  if (!previousContent) {
    return null;
  }

  // we need to find the user who's power level has changed
  const usersCurrentPowerLevels: { [userId: string]: number } = content.users;
  const usersPreviousPowerLevels: { [userId: string]: number } = previousContent.users;
  const changedUserIds = getObjectDiff(usersCurrentPowerLevels, usersPreviousPowerLevels);

  if (changedUserIds.length !== 1) {
    return null;
  }

  const userId = changedUserIds[0];
  const previousPowerLevel = usersPreviousPowerLevels[userId];
  const currentPowerLevel = usersCurrentPowerLevels[userId];

  if (
    (!previousPowerLevel || previousPowerLevel === PowerLevels.Viewer) &&
    currentPowerLevel === PowerLevels.Moderator
  ) {
    return { type: AdminMessageType.MEMBER_SET_AS_MODERATOR, userId };
  }

  if (
    previousPowerLevel === PowerLevels.Moderator &&
    (currentPowerLevel === PowerLevels.Viewer || !currentPowerLevel)
  ) {
    return { type: AdminMessageType.MEMBER_REMOVED_AS_MODERATOR, userId };
  }

  // Define power level changes to be checked
  const powerLevelChanges = [
    {
      from: PowerLevels.Viewer,
      to: PowerLevels.Moderator,
      type: AdminMessageType.MEMBER_SET_AS_MODERATOR,
    },
    {
      from: PowerLevels.Moderator,
      to: PowerLevels.Viewer,
      type: AdminMessageType.MEMBER_REMOVED_AS_MODERATOR,
    },
  ];

  // Check if the power level change matches any defined changes
  for (const { from, to, type } of powerLevelChanges) {
    if (previousPowerLevel === from && currentPowerLevel === to) {
      return { type, userId };
    }
  }

  return null;
}

export function mapToLiveRoomEvent(liveEvent) {
  const { event } = liveEvent;

  const eventType = convertToNotifiableEventType(event.type);

  return {
    id: event.event_id,
    type: eventType,
    createdAt: event.origin_server_ts,
    roomId: event.room_id,
    sender: {
      userId: event.sender,
    },
  };
}

function convertToNotifiableEventType(eventType) {
  switch (eventType) {
    case EventType.RoomMessageEncrypted:
    case EventType.RoomMessage:
    case CustomEventType.ROOM_POST:
      return NotifiableEventType.RoomMessage;
    default:
      return '';
  }
}

const ADMIN_USER = { userId: 'admin', firstName: '', lastName: '', profileImage: '', profileId: '', primaryZID: '' };
