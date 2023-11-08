import { CustomEventType } from './types';
import { MsgType, MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';
import { decryptFile } from './media';

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
  const { event_id, content, origin_server_ts, sender: senderId, updatedAt, type } = matrixMessage;

  const parent = matrixMessage.content['m.relates_to'];
  const isAdmin = type === CustomEventType.USER_JOINED_INVITER_ON_ZERO;
  const senderData = sdkMatrixClient.getUser(senderId);

  const adminData = isAdmin
    ? {
        type: content.type,
        inviterId: content.inviterId,
        inviteeId: content.inviteeId,
        creatorId: content.creatorId,
      }
    : {};

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
    isAdmin,
    admin: adminData,
    optimisticId: content.optimisticId,
    ...{
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
