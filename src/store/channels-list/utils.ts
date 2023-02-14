import { ChannelType } from './types';
import { Channel } from './../channels/index';
import { denormalize } from './../channels/index';
import getDeepProperty from 'lodash.get';

export function filterChannelsList(state, filter: ChannelType) {
  const channelIdList = getDeepProperty(state, 'channelsList.value', []);
  return channelIdList.filter((channelId) => {
    const channel = denormalize(channelId, state);

    if (filter === ChannelType.DirectMessage) {
      return Boolean(channel.isChannel);
    } else {
      return !Boolean(channel.isChannel);
    }
  });
}

export const channelMapper = (currentChannel, channelType: ChannelType) => {
  const channel: Partial<Channel> = {
    id: currentChannel.id,
    name: currentChannel.name,
    icon: currentChannel.icon,
    category: currentChannel.category,
    unreadCount: currentChannel.unreadCount,
    hasJoined: currentChannel.hasJoined,
    otherMembers: currentChannel.otherMembers || [],
  };

  if (channelType === ChannelType.DirectMessage) {
    channel.otherMembers = currentChannel.otherMembers || [];
    channel.isChannel = true;
  } else {
    channel.otherMembers = [];
    channel.isChannel = false;
  }

  if (currentChannel.groupChannelType) {
    channel.groupChannelType = currentChannel.groupChannelType;
  }

  return channel;
};
