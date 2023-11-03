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
  console.log('trying to map original message: ', matrixMessage);

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
    ...{ mentionedUsers: [], hidePreview: false, media: null, image: null, admin: {} },
    parentMessageText: '',
    parentMessageId: parent ? parent['m.in_reply_to']?.event_id : null,
    ...(await parseMediaData(matrixMessage)),
  };
}
