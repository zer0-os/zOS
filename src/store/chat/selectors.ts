import { RootState } from '../reducer';

export function activeChannelIdSelector(state: RootState) {
  return state.chat.activeChannelId;
}
