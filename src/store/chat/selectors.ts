import { rawChannel } from '../channels/selectors';
import { RootState } from '../reducer';
import { ErrorDialogContent } from './types';

export const rawActiveConversationSelector = (state: RootState) =>
  rawChannel(state, activeConversationIdSelector(state));

export const activeConversationIdSelector = (state: RootState): string | undefined => state.chat.activeConversationId;

export const joinRoomErrorContentSelector = (state: RootState): ErrorDialogContent | undefined =>
  state.chat.joinRoomErrorContent;

export const isSecondaryConversationDataLoadedSelector = (state: RootState): boolean =>
  state.chat.isSecondaryConversationDataLoaded;

export const isJoiningConversationSelector = (state: RootState): boolean => state.chat.isJoiningConversation;
