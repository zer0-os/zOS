import { Message } from './index';
import { User } from './../authentication/types';

export function messageFactory(messageText: string, user: User): Message {
  return {
    createdAt: Date.now(),
    hidePreview: false,
    id: Date.now(),
    mentionedUsers: [],
    message: messageText,
    sender: {
      userId: user.id,
      firstName: user.profileSummary.firstName,
      lastName: user.profileSummary.lastName,
      profileImage: user.profileSummary.profileImage,
      profileId: user.profileId,
    },
    updatedAt: 0,
    preview: null,
  };
}
