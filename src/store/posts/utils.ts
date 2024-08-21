import { v4 as uuidv4 } from 'uuid';

import { Message, MessageSendStatus } from './../messages';
import { User } from './../authentication/types';

export function createOptimisticPostObject(postText: string, user: User): Message {
  const id = uuidv4();

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
    media: null,
    sendStatus: MessageSendStatus.IN_PROGRESS,
    isPost: true,
  };
}
