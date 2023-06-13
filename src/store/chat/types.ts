export interface ChatState {
  isReconnecting: boolean;
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeConversationId: string;
}
