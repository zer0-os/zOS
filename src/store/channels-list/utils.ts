import { Channel, ConversationStatus, User } from './../channels/index';
import { select } from 'redux-saga/effects';
import { currentUserSelector } from '../authentication/selectors';
import { getUserSubHandle } from '../../lib/user';

export const toLocalChannel = (input): Partial<Channel> => {
  const otherMembers = input.otherMembers || [];

  return {
    id: input.id,
    name: input.name,
    icon: input.icon,
    unreadCount: input.unreadCount,
    createdAt: input.createdAt,
    otherMembers,
    lastMessage: input.lastMessage || null,
    conversationStatus: ConversationStatus.CREATED,
    isOneOnOne: input.isOneOnOne,
  };
};

export const mapChannelMembers = (channels: Channel[], zeroUsersMap: { [id: string]: User }) => {
  for (const channel of channels) {
    for (const member of channel.otherMembers) {
      replaceZOSUserFields(member, zeroUsersMap[member.matrixId]);
    }
    for (const member of channel.memberHistory) {
      replaceZOSUserFields(member as User, zeroUsersMap[member.matrixId]);
    }
  }
};

export function* mapChannelMessages(channels: Channel[], zeroUsersMap: { [id: string]: User }) {
  for (const channel of channels) {
    for (const message of channel.messages) {
      if (message.isAdmin) {
        continue;
      }
      replaceZOSUserFields(message.sender, zeroUsersMap[message.sender.userId]);
    }
  }
  yield mapAdminUserIdToZeroUserId(channels, zeroUsersMap);
}

export function* mapAdminUserIdToZeroUserId(messageContainers, zeroUsersMap) {
  const currentUser = yield select(currentUserSelector);

  if (!currentUser || !currentUser.matrixId) {
    return;
  }

  const currentUserId = currentUser.id;

  for (const container of messageContainers) {
    for (const message of container.messages) {
      if (message.isAdmin && message.admin.userId) {
        if (message.admin.userId === currentUser.matrixId) {
          message.admin.userId = currentUserId;
        } else {
          const user = zeroUsersMap[message.admin.userId];
          message.admin.userId = user?.userId || message.admin.userId;
        }
      }
    }
  }
}

export function replaceZOSUserFields(
  member: {
    userId: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    profileId: string;
    primaryZID: string;
    displaySubHandle?: string;
  },
  zeroUser: User
) {
  if (zeroUser) {
    member.userId = zeroUser.userId;
    member.profileId = zeroUser.profileId;
    member.firstName = zeroUser.firstName;
    member.lastName = zeroUser.lastName;
    member.profileImage = zeroUser.profileImage;
    member.primaryZID = zeroUser.primaryZID;
    member.displaySubHandle = getUserSubHandle(zeroUser.primaryZID, zeroUser.primaryWallet?.publicAddress);
  }
}

export function rawUserToDomainUser(u): User {
  return {
    userId: u.id,
    matrixId: u.matrixId,
    profileId: u.profileId,
    isOnline: false,
    firstName: u.profileSummary?.firstName,
    lastName: u.profileSummary?.lastName,
    profileImage: u.profileSummary?.profileImage,
    lastSeenAt: u.lastActiveAt,
    primaryZID: u.primaryZID,
    primaryWallet: u.primaryWallet,
    wallets: u.wallets,
  };
}
