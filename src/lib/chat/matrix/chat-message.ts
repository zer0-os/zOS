import { CustomEventType, MatrixConstants, MembershipStateType, NotifiableEventType } from './types';
import { EventType, IContent, IEvent, MsgType, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk/lib/matrix';
import { AdminMessageType, MediaType, Message, MessageSendStatus } from '../../../store/messages';
import { extractUserIdFromMatrixId, getObjectDiff, parsePlainBody } from './utils';
import { PowerLevels } from '../types';

export function parseMediaData(matrixEvent: Partial<IEvent>) {
  const { content } = matrixEvent;

  let media = null;
  try {
    if (
      content?.msgtype === MsgType.Image ||
      content?.msgtype === MsgType.Video ||
      content?.msgtype === MsgType.File ||
      content?.msgtype === MsgType.Audio
    ) {
      media = buildMediaObject(content);
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

export function buildMediaObject(content: IContent) {
  let mediaType: MediaType;
  if (content.msgtype === MsgType.Image) mediaType = MediaType.Image;
  else if (content.msgtype === MsgType.Video) mediaType = MediaType.Video;
  else if (content.msgtype === MsgType.File) mediaType = MediaType.File;
  else if (content.msgtype === MsgType.Audio) mediaType = MediaType.Audio;
  if (content.file && content.info) {
    return {
      body: content.body,
      url: null,
      type: mediaType,
      file: { ...content.file },
      ...content.info,
    };
  } else if (content.url) {
    return {
      body: content.body,
      url: content.url,
      type: mediaType,
      ...content.info,
    };
  }
  return null;
}

// TODO: zos-619: This should be part of the MatrixAdapter
export function mapMatrixMessage(matrixEvent: Partial<IEvent>, sdkMatrixClient: SDKMatrixClient): Message {
  const { event_id, content, origin_server_ts, sender: senderId } = matrixEvent;

  const parent = matrixEvent.content['m.relates_to'];
  const senderData = sdkMatrixClient.getUser(senderId);

  let messageContent = content.body;
  if (parent && parent['m.in_reply_to']) {
    messageContent = parsePlainBody(content.body);
  }

  const message =
    content.msgtype === MsgType.Image || content.msgtype === MsgType.Video || content.msgtype === MsgType.Audio
      ? ''
      : messageContent;

  return {
    id: event_id,
    message,
    createdAt: origin_server_ts,
    updatedAt: 0,
    sender: {
      userId: extractUserIdFromMatrixId(senderId),
      matrixId: senderId,
      firstName: senderData?.displayName ?? '',
      lastName: '',
      profileImage: senderData?.avatarUrl ?? '',
      profileId: '',
      primaryZID: '',
    },
    isPost: false,
    sendStatus: MessageSendStatus.SUCCESS,
    isAdmin: false,
    optimisticId: content.optimisticId,
    mentionedUsers: [],
    hidePreview: false,
    media: null,
    image: null,
    parentMessageText: '',
    parentMessageMedia: null,
    parentMessageId: parent ? parent['m.in_reply_to']?.event_id : null,
    isHidden: content?.msgtype === MatrixConstants.BAD_ENCRYPTED_MSGTYPE,
    ...parseMediaData(matrixEvent),
  };
}

// TODO: zos-619: This should be part of the MatrixAdapter
export function mapEventToAdminMessage(matrixEvent: IEvent): Message {
  const { event_id, content, origin_server_ts, sender, type, state_key: targetUserId, unsigned } = matrixEvent;

  const adminData = getAdminDataFromEventType(
    type,
    content,
    extractUserIdFromMatrixId(sender),
    extractUserIdFromMatrixId(targetUserId),
    unsigned?.prev_content
  );

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
    sendStatus: MessageSendStatus.SUCCESS,
    isPost: false,
  };
}

// TODO: zos-619: This should be part of the MatrixAdapter
export function mapEventToPostMessage(matrixEvent: IEvent, sdkMatrixClient: SDKMatrixClient): Message {
  const { event_id, content, origin_server_ts, sender: senderId } = matrixEvent;

  const senderData = sdkMatrixClient.getUser(senderId);
  const { media, image, rootMessageId } = parseMediaData(matrixEvent);

  return {
    id: event_id,
    message: content.body,
    createdAt: origin_server_ts,
    updatedAt: 0,
    optimisticId: content.optimisticId,

    sender: {
      userId: extractUserIdFromMatrixId(senderId),
      matrixId: senderId,
      firstName: senderData?.displayName ?? '',
      lastName: '',
      profileImage: senderData?.avatarUrl ?? '',
      profileId: '',
      displaySubHandle: '',
      primaryZID: '',
    },

    isAdmin: false,
    mentionedUsers: [],
    hidePreview: false,
    sendStatus: MessageSendStatus.SUCCESS,
    isPost: true,
    media,
    image,
    rootMessageId,
    reactions: {},
  };
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
  if (previousContent?.avatar_url && previousContent?.avatar_url !== content.avatar_url) {
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

const ADMIN_USER = {
  userId: 'admin',
  firstName: '',
  lastName: '',
  profileImage: '',
  profileId: '',
  primaryZID: '',
  matrixId: '',
};
