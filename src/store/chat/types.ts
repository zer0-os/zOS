export interface ChatState {
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeConversationId: string;
  isConversationErrorDialogOpen: boolean;
}
