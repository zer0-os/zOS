import { CustomEventType } from './types';
import { MsgType, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';
import { decryptFile } from './media';
import { AdminMessageType } from '../../../store/messages';

async function parseMediaData(matrixMessage) {
  const { content } = matrixMessage;

  let media: any = {};
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
      firstName: senderData.displayName,
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

export function mapEventToAdminMessage(matrixMessage) {
  const { event_id, content, origin_server_ts, sender: senderId, type } = matrixMessage;

  const adminMessageType =
    type === CustomEventType.USER_JOINED_INVITER_ON_ZERO
      ? AdminMessageType.JOINED_ZERO
      : AdminMessageType.CONVERSATION_STARTED;

  return {
    id: event_id,
    message: 'Conversation was started',
    createdAt: origin_server_ts,
    isAdmin: true,
    sender: {
      userId: senderId,
    },
    admin: { type: adminMessageType, inviterId: content.inviterId, inviteeId: content.inviteeId, creatorId: senderId },
  };
}
