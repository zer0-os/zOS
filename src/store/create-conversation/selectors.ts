import { Stage } from '.';
import { RootState } from '../reducer';

export const stageSelector = (state: RootState): Stage => state.createConversation.stage;

export const groupUsersSelector = (
  state: RootState
): {
  value: string;
  label: string;
  image?: string;
}[] => state.createConversation.groupUsers;

export const isFetchingExistingConversationsSelector = (state: RootState): boolean =>
  state.createConversation.startGroupChat.isLoading;
