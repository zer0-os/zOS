import { rawChannelSelector } from '../channels/saga';
import { RootState } from '../reducer';

export function activeConversationIdSelector(state: RootState) {
  return state.chat.activeConversationId;
}

export function rawActiveConversationSelector(state: RootState) {
  return rawChannelSelector(activeConversationIdSelector(state))(state);
}
