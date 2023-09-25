import { MatrixClient as SDKMatrixClient } from 'matrix-js-sdk';

async function extractParentMessageData(matrixMessage, sdkMatrixClient: SDKMatrixClient) {
  const parentMessageData = {
    parentMessageId: null,
    parentMessageText: '',
  };

  const parent = matrixMessage.content['m.relates_to'];
  if (parent && parent['m.in_reply_to']) {
    parentMessageData.parentMessageId = parent['m.in_reply_to'].event_id;

    const parentMessage = await sdkMatrixClient.fetchRoomEvent(
      matrixMessage.room_id,
      parentMessageData.parentMessageId
    );
    if (parentMessage) {
      parentMessageData.parentMessageText = parentMessage.content.body;
    }
  }

  return parentMessageData;
}

export async function mapMatrixMessage(matrixMessage, sdkMatrixClient: SDKMatrixClient) {
  return {
    id: matrixMessage.event_id,
    message: matrixMessage.content.body,
    createdAt: matrixMessage.origin_server_ts,
    updatedAt: null,
    sender: {},
    isAdmin: false,
    ...{ mentionedUsers: [], hidePreview: false, media: null, image: null, admin: {} },
    ...(await extractParentMessageData(matrixMessage, sdkMatrixClient)),
  };
}
