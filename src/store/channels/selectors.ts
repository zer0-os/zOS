import { RootState } from '../reducer';
import getDeepProperty from 'lodash.get';

export const rawChannel = (state: RootState, channelId: string) => {
  return getDeepProperty(state, `normalized.channels['${channelId}']`, null);
};
