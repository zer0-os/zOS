import { RootState } from '../reducer';

export function activeChannelIdSelector(state: RootState) {
  return state.chat.activeChannelId;
}

export function activeConversationIdSelector(state: RootState) {
  return state.chat.activeConversationId;
}
