import { ChannelType } from './types';
import { Channel, ConversationStatus } from './../channels/index';
import { denormalize } from './../channels/index';
import getDeepProperty from 'lodash.get';
import { User } from '../authentication/types';

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
      const zeroUser = zeroUsersMap[member.matrixId];
      if (zeroUser && zeroUser?.profileSummary) {
        member.userId = zeroUser.id;
        member.profileId = zeroUser.profileSummary.id;
        member.firstName = zeroUser.profileSummary.firstName;
        member.lastName = zeroUser.profileSummary.lastName;
        member.profileImage = zeroUser.profileSummary.profileImage;
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

      const zeroUser = zeroUsersMap[message.sender.userId];
      if (zeroUser && zeroUser?.profileSummary) {
        message.sender.userId = zeroUser.id;
        message.sender.profileId = zeroUser.profileSummary.id;
        message.sender.firstName = zeroUser.profileSummary.firstName;
        message.sender.lastName = zeroUser.profileSummary.lastName;
        message.sender.profileImage = zeroUser.profileSummary.profileImage;
      }
    }
  }
};

export function extractMatrixIdsFromConversations(conversations) {
  const matrixIdsSet = new Set();
  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.isAdmin && msg.admin.creatorId) {
        matrixIdsSet.add(msg.admin.creatorId);
      } else if (msg.sender?.userId) {
        matrixIdsSet.add(msg.sender.userId);
      }
    }
  }
  return Array.from(matrixIdsSet);
}
