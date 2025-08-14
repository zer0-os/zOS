import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../../../store/reducer';
import { allChannelsSelector } from '../../../../../store/channels/selectors';

export const selectSocialChannelsMemberCounts = createSelector(
  [(state: RootState) => allChannelsSelector(state)],
  (conversations) => {
    return conversations
      .filter((c) => c.isSocialChannel && c.zid)
      .reduce((acc, channel) => {
        // we don't include current user in member count as the ZERO admin user is not considered a member
        // so the total balances out
        acc[channel.zid!] = channel.otherMembers?.length || 0;
        return acc;
      }, {} as { [zid: string]: number });
  }
);
