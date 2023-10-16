import { MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';

export function mapMatrixMessage(matrixMessage, sdkMatrixClient: SDKMatrixClient) {
  const { event_id, content, origin_server_ts, sender: senderId } = matrixMessage;
  const parent = matrixMessage.content['m.relates_to'];

  const relatesTo = content['m.relates_to'];
  const isEdited = relatesTo && relatesTo.rel_type === 'm.replace';

  const messageBody = isEdited
    ? relatesTo['m.new_content']
      ? relatesTo['m.new_content'].body
      : content.body
    : content.body;

  const senderData = sdkMatrixClient.getUser(senderId);

  return {
    id: event_id,
    message: messageBody,
    createdAt: origin_server_ts,
    updatedAt: null,
    sender: {
      userId: senderId,
      firstName: senderData.displayName,
      lastName: '',
      profileImage: '',
      profileId: '',
    },
    isAdmin: false,
    optimisticId: content.optimisticId,
    ...{ mentionedUsers: [], hidePreview: false, media: null, image: null, admin: {} },
    parentMessageText: '',
    parentMessageId: parent ? parent['m.in_reply_to']?.event_id : null,
  };
}
