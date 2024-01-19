import { ErrorDialogContent } from '../../components/error-dialog';

export interface ChatState {
  chatAccessToken: {
    value: string;
    isLoading: boolean;
  };
  activeConversationId: string;
  joinRoomErrorContent: ErrorDialogContent;
}
