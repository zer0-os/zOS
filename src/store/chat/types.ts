export interface ChatState {
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeConversationId: string;
  isErrorDialogOpen: boolean;
}
