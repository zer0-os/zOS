import { ChannelType } from './types';
import { GroupChannelType, Channel, ConversationStatus } from './../channels/index';
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

export const matrixChannelMapper = (currentChannel): Partial<Channel> => {
  return {
    id: currentChannel.room_id,
    name: currentChannel.name,
    icon: currentChannel.avatar_url,

    isChannel: true,
    otherMembers: [],
    lastMessage: null,
    lastMessageCreatedAt: null,
    groupChannelType: GroupChannelType.Public,
    category: '',
    unreadCount: 0,
    hasJoined: true,
    createdAt: 0,

    // category: currentChannel.category,
    // unreadCount: currentChannel.unreadCount,
    // hasJoined: currentChannel.hasJoined,
    // createdAt: currentChannel.createdAt,
    // otherMembers: currentChannel.otherMembers || [],
    // lastMessage: currentChannel.lastMessage || null,
    // lastMessageCreatedAt: currentChannel.lastMessage?.createdAt || null,
    // isChannel: currentChannel.isChannel === undefined ? true : currentChannel.isChannel,
    // groupChannelType: currentChannel.groupChannelType || '',
  };
};

export const channelMapper = (currentChannel): Partial<Channel> => {
  return {
    id: currentChannel.id,
    name: currentChannel.name,
    icon: currentChannel.icon,
    category: currentChannel.category,
    unreadCount: currentChannel.unreadCount,
    hasJoined: currentChannel.hasJoined,
    createdAt: currentChannel.createdAt,
    otherMembers: currentChannel.otherMembers || [],
    lastMessage: currentChannel.lastMessage || null,
    lastMessageCreatedAt: currentChannel.lastMessage?.createdAt || null,
    isChannel: currentChannel.isChannel === undefined ? true : currentChannel.isChannel,
    groupChannelType: currentChannel.groupChannelType || '',
    conversationStatus: ConversationStatus.CREATED,
  };
};
