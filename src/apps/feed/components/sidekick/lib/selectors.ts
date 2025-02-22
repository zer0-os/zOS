import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../../store/reducer';
import { denormalizeConversations } from '../../../../../store/channels-list';
import { UnreadCount } from './useSidekick';

export const selectSocialChannelsUnreadCounts = createSelector(
  [(state: RootState) => denormalizeConversations(state)],
  (conversations) => {
    return conversations
      .filter((c) => c.isSocialChannel && c.zid)
      .reduce((acc, channel) => {
        acc[channel.zid!] = { total: channel.unreadCount?.total || 0, highlight: channel.unreadCount?.highlight || 0 };
        return acc;
      }, {} as { [zid: string]: UnreadCount });
  }
);
