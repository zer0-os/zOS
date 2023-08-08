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
  return {
    id: input.id,
    name: input.name,
    icon: input.icon,
    category: input.category,
    unreadCount: input.unreadCount,
    hasJoined: input.hasJoined,
    createdAt: input.createdAt,
    otherMembers: input.otherMembers || [],
    lastMessage: input.lastMessage || null,
    lastMessageCreatedAt: input.lastMessage?.createdAt || null,
    isChannel: input.isChannel === undefined ? true : input.isChannel,
    groupChannelType: input.groupChannelType || '',
    conversationStatus: ConversationStatus.CREATED,
  };
};
