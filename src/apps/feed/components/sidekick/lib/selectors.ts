import { createSelector } from '@reduxjs/toolkit';
import { UnreadCount } from './useSidekick';
import { DefaultRoomLabels } from '../../../../../store/channels';
import { denormalizedConversationsSelector } from '../../../../../store/channels-list/selectors';

export const selectSocialChannelsUnreadCounts = createSelector([denormalizedConversationsSelector], (conversations) => {
  return conversations
    .filter((c) => c.isSocialChannel && c.zid)
    .reduce((acc, channel) => {
      acc[channel.zid!] = { total: channel.unreadCount?.total || 0, highlight: channel.unreadCount?.highlight || 0 };
      return acc;
    }, {} as { [zid: string]: UnreadCount });
});

export const selectMutedChannels = createSelector([denormalizedConversationsSelector], (conversations) => {
  return conversations
    .filter((c) => c.isSocialChannel && c.zid)
    .reduce((acc, channel) => {
      acc[channel.zid!] = channel.labels?.includes(DefaultRoomLabels.MUTE);
      return acc;
    }, {} as { [zid: string]: boolean });
});
