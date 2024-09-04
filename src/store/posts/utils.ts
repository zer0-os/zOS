import { v4 as uuidv4 } from 'uuid';

import { MediaType, Message, MessageSendStatus } from './../messages';
import { User } from './../authentication/types';

export function createOptimisticPostObject(
  postText: string,
  user: User,
  file?: { name: string; url: string; mediaType: MediaType; giphy: any },
  rootMessageId?: string
): Message {
  const id = uuidv4();
  let media;

  if (file) {
    media = {
      type: file.mediaType,
      url: file.giphy ? file.giphy.images.downsized.url : file.url,
      name: file.name,
      height: 0,
      width: 0,
    };
  }

  return {
    createdAt: Date.now(),
    hidePreview: false,
    id,
    optimisticId: id,
    mentionedUsers: [],
    message: postText,
    isAdmin: false,
    sender: {
      userId: user.id,
      firstName: user.profileSummary.firstName,
      lastName: user.profileSummary.lastName,
      profileImage: user.profileSummary.profileImage,
      profileId: user.profileId,
      primaryZID: user.primaryZID,
    },
    updatedAt: 0,
    preview: null,
    media,
    sendStatus: MessageSendStatus.IN_PROGRESS,
    isPost: true,
    rootMessageId,
  };
}
