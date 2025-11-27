import { ChatState } from '../types';

export const mockChatState: ChatState = {
  activeConversationId: '',
  joinRoomErrorContent: undefined,
  isSecondaryConversationDataLoaded: true,
  isJoiningConversation: false,
  isChatConnectionComplete: false,
  isConversationsLoaded: false,
  loadingConversationProgress: 0,
  isSyncing: false,
};
