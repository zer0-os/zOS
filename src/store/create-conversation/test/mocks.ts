import { CreateConversationState, Stage } from '..';

export const mockCreateConversationState: CreateConversationState = {
  stage: Stage.None,
  groupUsers: [],
  startGroupChat: {
    isLoading: false,
  },
  groupDetails: {
    isCreating: false,
  },
};
