import { RootState } from '../reducer';
import getDeepProperty from 'lodash.get';
import { createSelector } from 'reselect';
import { denormalize as denormalizeChannel } from '../channels';

export const rawChannel = (state: RootState, channelId: string) => {
  return getDeepProperty(state, `normalized.channels['${channelId}']`, null);
};

// Memoized selector for denormalized channel
export const denormalizedChannelSelector = createSelector(
  [(state: RootState) => state, (_state: RootState, channelId: string) => channelId],
  (state, channelId) => {
    return denormalizeChannel(channelId, state);
  }
);
