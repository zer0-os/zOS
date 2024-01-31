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
};

export enum SagaActionTypes {
  CloseConversationErrorDialog = 'chat/saga/closeConversationErrorDialog',
  setActiveConversationId = 'chat/saga/setActiveConversationId',
  SetIsJoiningConversation = 'chat/saga/setIsJoiningConversation',
}

const closeConversationErrorDialog = createAction(SagaActionTypes.CloseConversationErrorDialog);
export const setActiveConversationId = createAction<{ id: string }>(SagaActionTypes.setActiveConversationId);

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
  },
});

export const {
  setChatAccessToken,
  rawSetActiveConversationId,
  setJoinRoomErrorContent,
  clearJoinRoomErrorContent,
  setIsJoiningConversation,
} = slice.actions;
export const { reducer } = slice;
export { closeConversationErrorDialog };
