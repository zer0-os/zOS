import { ChannelType } from './types';
import { Channel, ConversationStatus } from './../channels/index';
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
