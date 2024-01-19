export type ErrorDialogContent = {
  header: string;
  body: string;
};

export interface ChatState {
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeConversationId: string;
  joinRoomErrorContent: ErrorDialogContent;
}
