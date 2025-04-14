import { Channel, denormalize } from '.';
import { RootState } from '../reducer';
import getDeepProperty from 'lodash.get';
import { createSelector } from '@reduxjs/toolkit';
import { byBumpStamp, isOneOnOne } from '../channels-list/utils';

export const rawChannel = (state: RootState, channelId: string) => {
  return getDeepProperty(state, `normalized.channels['${channelId}']`, null);
};

export const channelSelector =
  (channelId: string) =>
  (state: RootState): Channel | null => {
    return denormalize(channelId, state);
  };

export const allChannelsSelector = (state: RootState): Channel[] => {
  const channels = getDeepProperty(state, 'normalized.channels', {}) as Record<string, Channel>;
  return Object.values(channels).sort(byBumpStamp);
};

export const allDenormalizedChannelsSelector = (state: RootState): Channel[] => {
  return allChannelsSelector(state).map((channel) => denormalize(channel.id, state));
};

export const isOneOnOneSelector = createSelector(
  [(state: RootState, channelId: string) => channelSelector(channelId)(state)],
  (channel) => isOneOnOne(channel)
);

export const oneOnOnesSelector = createSelector([allChannelsSelector], (channels) =>
  channels.filter((channel) => isOneOnOne(channel))
);

export const mostRecentConversation = createSelector([allDenormalizedChannelsSelector, (state) => state], (rooms) => {
  if (!rooms.length) {
    return null;
  }

  return rooms.sort(byBumpStamp)[0];
});
