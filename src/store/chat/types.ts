export type ErrorDialogContent = {
  header: string;
  body: string;
  linkPath?: string;
  linkText?: string;
};

export interface ChatState {
  activeConversationId: string | null;
  joinRoomErrorContent: ErrorDialogContent | null;
  isJoiningConversation: boolean;
  isChatConnectionComplete: boolean;
  isConversationsLoaded: boolean;
  isSecondaryConversationDataLoaded: boolean;
  loadingConversationProgress: number;
}
