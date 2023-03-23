import { ChannelType } from './types';
import { Channel } from './../channels/index';
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

export const channelMapper = (currentChannel): Partial<Channel> => {
  return {
    id: currentChannel.id,
    name: currentChannel.name,
    icon: currentChannel.icon,
    category: currentChannel.category,
    unreadCount: currentChannel.unreadCount,
    hasJoined: currentChannel.hasJoined,
    otherMembers: currentChannel.otherMembers || [],
    lastMessage: currentChannel.lastMessage || null,
    lastMessageCreatedAt: currentChannel.lastMessageCreatedAt || null,
    isChannel: currentChannel.isChannel === undefined ? true : currentChannel.isChannel,
    groupChannelType: currentChannel.groupChannelType || '',
  };
};
