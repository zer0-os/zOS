import { MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';
import { CustomEventType } from './types';

export function mapMatrixMessage(matrixMessage, sdkMatrixClient: SDKMatrixClient) {
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
    isAdmin: isAdmin,
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
  };
}
