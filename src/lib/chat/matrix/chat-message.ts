import { CustomEventType, MembershipStateType, NotifiableEventType } from './types';
import { EventType, MsgType, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';
import { decryptFile } from './media';
import { AdminMessageType, Message, MessageSendStatus } from '../../../store/messages';

async function parseMediaData(matrixMessage) {
  const { content } = matrixMessage;

  let media = null;
  try {
    if (content?.msgtype === MsgType.Image) {
      const { file, info } = content;
      const blob = await decryptFile(file, info);
      media = {
        url: URL.createObjectURL(blob),
        type: 'image',
        ...info,
      };
    }
  } catch (e) {
    // ingore for now
    console.log('error ocurred while parsing media data: ', e);
  }

  return {
    media,
    image: content?.msgtype === MsgType.Image ? media : undefined,
    rootMessageId: media?.rootMessageId || '',
  };
}

export async function mapMatrixMessage(matrixMessage, sdkMatrixClient: SDKMatrixClient) {
  const { event_id, content, origin_server_ts, sender: senderId, updatedAt } = matrixMessage;

  const parent = matrixMessage.content['m.relates_to'];
  const senderData = sdkMatrixClient.getUser(senderId);

  return {
    id: event_id,
    message: content.body,
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
    parentMessageId: parent ? parent['m.in_reply_to']?.event_id : null,
    ...(await parseMediaData(matrixMessage)),
  };
}

export function mapEventToAdminMessage(matrixMessage): Message {
  const { event_id, content, origin_server_ts, sender, type, state_key: targetUserId } = matrixMessage;

  const adminData = getAdminDataFromEventType(type, content, sender, targetUserId);

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
  };
}

function getAdminDataFromEventType(type, content, sender, targetUserId) {
  switch (type) {
    case CustomEventType.USER_JOINED_INVITER_ON_ZERO:
      return { type: AdminMessageType.JOINED_ZERO, inviterId: content.inviterId, inviteeId: content.inviteeId };
    case EventType.RoomMember:
      return getRoomMemberAdminData(content, targetUserId);
    case EventType.RoomCreate:
      return { type: AdminMessageType.CONVERSATION_STARTED, userId: sender };
    default:
      return null;
  }
}

function getRoomMemberAdminData(content, targetUserId) {
  switch (content.membership) {
    case MembershipStateType.Leave:
      return { type: AdminMessageType.MEMBER_LEFT_CONVERSATION, userId: targetUserId };
    case MembershipStateType.Invite:
      return { type: AdminMessageType.MEMBER_ADDED_TO_CONVERSATION, userId: targetUserId };
    default:
      return null;
  }
}

export function mapToLiveRoomEvent(liveEvent) {
  const { event } = liveEvent;

  const eventType = convertToNotifiableEventType(event.type);

  return {
    id: event.event_id,
    type: eventType,
    createdAt: event.origin_server_ts,
    sender: {
      userId: event.sender,
    },
  };
}

function convertToNotifiableEventType(eventType) {
  switch (eventType) {
    case EventType.RoomMessageEncrypted:
    case EventType.RoomMessage:
      return NotifiableEventType.RoomMessage;
    default:
      return '';
  }
}

const ADMIN_USER = { userId: 'admin', firstName: '', lastName: '', profileImage: '', profileId: '', primaryZID: '' };
