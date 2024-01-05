import { RootState } from '../reducer';

export function activeConversationIdSelector(state: RootState) {
  return state.chat.activeConversationId;
}
