import { Channel, DefaultRoomLabels, denormalize, NormalizedChannel } from '.';
import { RootState } from '../reducer';
import getDeepProperty from 'lodash.get';
import { createSelector } from '@reduxjs/toolkit';
import { byBumpStamp, isOneOnOne } from '../channels-list/utils';

export const rawChannel = (state: RootState, channelId: string) => {
  return getDeepProperty(state, `normalized.channels['${channelId}']`, null);
};

/**
 * Selector for getting a denormalized channel by ID.
 * Use this sparingly as denormalization causes new references to be created for each render.
 * useChannelSelector is typically a better choice.
 * @param channelId - The ID of the channel to select.
 * @returns The denormalized channel with the given ID.
 */
export const channelSelector =
  (channelId: string) =>
  (state: RootState): Channel | null => {
    return denormalize(channelId, state);
  };

export const allChannelsSelector = (state: RootState): NormalizedChannel[] => {
  const channels = getDeepProperty(state, 'normalized.channels', {}) as Record<string, NormalizedChannel>;
  return Object.values(channels).sort(byBumpStamp);
};

export const allChannelIdsSelector = (state: RootState): string[] => {
  return Object.keys(getDeepProperty(state, 'normalized.channels', {}));
};

export const allDenormalizedChannelsSelector = (state: RootState): Channel[] => {
  return allChannelsSelector(state).map((channel) => denormalize(channel.id, state));
};

export const isOneOnOneSelector = createSelector(
  [(state: RootState, channelId: string) => channelSelector(channelId)(state)],
  (channel: Channel | undefined) => channel && isOneOnOne(channel)
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

export function hasUnreadNotificationsSelector(state: RootState) {
  const conversations = allDenormalizedChannelsSelector(state);
  return conversations.some(
    (channel) =>
      channel.unreadCount?.total > 0 &&
      !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
      !channel.labels?.includes(DefaultRoomLabels.MUTE)
  );
}

export function hasUnreadHighlightsSelector(state: RootState) {
  const conversations = allDenormalizedChannelsSelector(state);
  return conversations.some(
    (channel) =>
      channel.unreadCount?.highlight > 0 &&
      !channel.labels?.includes(DefaultRoomLabels.ARCHIVED) &&
      !channel.labels?.includes(DefaultRoomLabels.MUTE)
  );
}
export const makeGetChannelById = () => {
  return createSelector(
    [(state: RootState) => state.normalized.channels, (_state: RootState, channelId: string) => channelId],
    (allChannels, channelId) => {
      if (!allChannels || !channelId) return null;
      return allChannels[channelId] as NormalizedChannel | null;
    }
  );
};

export const socialChannelsSelector = createSelector([allDenormalizedChannelsSelector], (channels) =>
  channels.filter((channel) => channel.isSocialChannel && channel.zid)
);
