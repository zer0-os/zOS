export type ErrorDialogContent = {
  header: string;
  body: string;
  linkPath?: string;
  linkText?: string;
};

export interface ChatState {
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeConversationId: string;
  joinRoomErrorContent: ErrorDialogContent;
}
