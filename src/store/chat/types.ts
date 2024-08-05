export type ErrorDialogContent = {
  header: string;
  body: string;
  linkPath?: string;
  linkText?: string;
};

export interface ChatState {
  activeConversationId: string;
  joinRoomErrorContent: ErrorDialogContent;
  isJoiningConversation: boolean;
  isChatConnectionComplete: boolean;
  isConversationsLoaded: boolean;
  isSecondaryConversationDataLoaded: boolean;
}
