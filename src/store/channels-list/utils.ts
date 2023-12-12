import { ChannelType } from './types';
import { Channel, ConversationStatus, User } from './../channels/index';
import { denormalize } from './../channels/index';
import getDeepProperty from 'lodash.get';

export function filterChannelsList(state, filter: ChannelType) {
  const channelIdList = getDeepProperty(state, 'channelsList.value', []);
  return channelIdList.filter((channelId) => {
    const channel = denormalize(channelId, state);

    if (filter === ChannelType.DirectMessage) {
      return !channel.isChannel;
    } else {
      return channel.isChannel;
    }
  });
}

export const toLocalChannel = (input): Partial<Channel> => {
  const isChannel = (input.isChannel ?? true) || !!input.isChannel;
  const otherMembers = input.otherMembers || [];

  return {
    id: input.id,
    name: input.name,
    icon: input.icon,
    category: input.category,
    unreadCount: input.unreadCount,
    hasJoined: input.hasJoined,
    createdAt: input.createdAt,
    otherMembers,
    lastMessage: input.lastMessage || null,
    isChannel,
    groupChannelType: input.groupChannelType || '', // Is this the right default to use?
    conversationStatus: ConversationStatus.CREATED,
    isOneOnOne: !isChannel && input.isDistinct && otherMembers.length === 1,
  };
};

export const mapOtherMembers = (channels: Channel[], zeroUsersMap: { [id: string]: User }) => {
  for (const channel of channels) {
    for (const member of channel.otherMembers) {
      replaceZOSUserFields(member, zeroUsersMap[member.matrixId]);
    }
  }
};

export const mapMemberHistory = (channels: Channel[], zeroUsersMap: { [id: string]: User }) => {
  for (const channel of channels) {
    for (const member of channel.memberHistory) {
      const zeroUser = zeroUsersMap[member.matrixId];
      if (zeroUser) {
        member.userId = zeroUser.userId;
        member.firstName = zeroUser.firstName;
      }
    }
  }
};

export const mapChannelMessages = (channels: Channel[], zeroUsersMap: { [id: string]: User }) => {
  for (const channel of channels) {
    for (const message of channel.messages) {
      if (message.isAdmin) {
        continue;
      }
      replaceZOSUserFields(message.sender, zeroUsersMap[message.sender.userId]);
    }
  }
};

export function replaceZOSUserFields(
  member: {
    userId: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    profileId: string;
  },
  zeroUser: User
) {
  if (zeroUser) {
    member.userId = zeroUser.userId;
    member.profileId = zeroUser.profileId;
    member.firstName = zeroUser.firstName;
    member.lastName = zeroUser.lastName;
    member.profileImage = zeroUser.profileImage;
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
  };
}
