import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../../store/reducer';
import { allChannelsSelector } from '../../../../../store/channels/selectors';
import { UnreadCount } from './useSidekick';
import { DefaultRoomLabels } from '../../../../../store/channels';

export const selectSocialChannelsUnreadCounts = createSelector(
  [(state: RootState) => allChannelsSelector(state)],
  (conversations) => {
    return conversations
      .filter((c) => c.isSocialChannel && c.zid)
      .reduce((acc, channel) => {
        acc[channel.zid!] = { total: channel.unreadCount?.total || 0, highlight: channel.unreadCount?.highlight || 0 };
        return acc;
      }, {} as { [zid: string]: UnreadCount });
  }
);

export const selectMutedChannels = createSelector(
  [(state: RootState) => allChannelsSelector(state)],
  (conversations) => {
    return conversations
      .filter((c) => c.isSocialChannel && c.zid)
      .reduce((acc, channel) => {
        acc[channel.zid!] = channel.labels?.includes(DefaultRoomLabels.MUTE);
        return acc;
      }, {} as { [zid: string]: boolean });
  }
);

export const selectSocialChannelsMemberCounts = createSelector(
  [(state: RootState) => allChannelsSelector(state)],
  (conversations) => {
    return conversations
      .filter((c) => c.isSocialChannel && c.zid)
      .reduce((acc, channel) => {
        acc[channel.zid!] = channel.totalMembers || 0;
        return acc;
      }, {} as { [zid: string]: number });
  }
);
