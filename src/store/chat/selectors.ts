import { rawChannel } from '../channels/selectors';
import { RootState } from '../reducer';

export function activeConversationIdSelector(state: RootState) {
  return state.chat.activeConversationId;
}

export function rawActiveConversationSelector(state: RootState) {
  return rawChannel(state, activeConversationIdSelector(state));
}
