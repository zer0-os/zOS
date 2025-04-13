import { denormalize } from '.';
import { RootState } from '../reducer';
import getDeepProperty from 'lodash.get';

export const rawChannel = (state: RootState, channelId: string) => {
  return getDeepProperty(state, `normalized.channels['${channelId}']`, null);
};

export const channelSelector = (channelId: string) => (state: RootState) => {
  return denormalize(channelId, state);
};
