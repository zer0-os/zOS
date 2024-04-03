import { ChatState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ChatState = {
  chatAccessToken: {
    isLoading: false,
    value: null,
  },
  activeConversationId: null,
  joinRoomErrorContent: null,
  isJoiningConversation: false,
  isChatConnectionComplete: false,
  isFavoritesError: false,
};

export enum SagaActionTypes {
  CloseConversationErrorDialog = 'chat/saga/closeConversationErrorDialog',
  setActiveConversationId = 'chat/saga/setActiveConversationId',
  SetIsJoiningConversation = 'chat/saga/setIsJoiningConversation',
  CloseFavoritesError = 'chat/saga/closeFavoritesError',
}

const closeConversationErrorDialog = createAction(SagaActionTypes.CloseConversationErrorDialog);
export const setActiveConversationId = createAction<{ id: string }>(SagaActionTypes.setActiveConversationId);
const closeFavoritesError = createAction(SagaActionTypes.CloseFavoritesError);

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatAccessToken: (state, action: PayloadAction<ChatState['chatAccessToken']>) => {
      state.chatAccessToken = action.payload;
    },
    rawSetActiveConversationId: (state, action: PayloadAction<ChatState['activeConversationId']>) => {
      state.activeConversationId = action.payload;
    },
    setJoinRoomErrorContent: (state, action: PayloadAction<ChatState['joinRoomErrorContent']>) => {
      state.joinRoomErrorContent = action.payload;
    },
    clearJoinRoomErrorContent: (state) => {
      state.joinRoomErrorContent = null;
    },
    setIsJoiningConversation: (state, action: PayloadAction<ChatState['isJoiningConversation']>) => {
      state.isJoiningConversation = action.payload;
    },
    setIsChatConnectionComplete: (state, action: PayloadAction<ChatState['isChatConnectionComplete']>) => {
      state.isChatConnectionComplete = action.payload;
    },
    setIsFavoritesError: (state, action: PayloadAction<ChatState['isFavoritesError']>) => {
      state.isFavoritesError = action.payload;
    },
  },
});

export const {
  setChatAccessToken,
  rawSetActiveConversationId,
  setJoinRoomErrorContent,
  clearJoinRoomErrorContent,
  setIsJoiningConversation,
  setIsChatConnectionComplete,
  setIsFavoritesError,
} = slice.actions;
export const { reducer } = slice;
export { closeConversationErrorDialog, closeFavoritesError };
