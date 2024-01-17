import { ErrorDialogContent } from '../../components/error-dialog';

export interface ChatState {
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeConversationId: string;
  isConversationErrorDialogOpen: boolean;
  joinRoomErrorContent: ErrorDialogContent;
}
