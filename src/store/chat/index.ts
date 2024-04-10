import { ChatState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ChatState = {
  activeConversationId: null,
  joinRoomErrorContent: null,
  isJoiningConversation: false,
  isChatConnectionComplete: false,
  isConversationsLoaded: false,
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
    setIsConversationsLoaded: (state, action: PayloadAction<ChatState['isConversationsLoaded']>) => {
      state.isConversationsLoaded = action.payload;
    },
  },
});

export const {
  rawSetActiveConversationId,
  setJoinRoomErrorContent,
  clearJoinRoomErrorContent,
  setIsJoiningConversation,
  setIsChatConnectionComplete,
  setIsConversationsLoaded,
} = slice.actions;
export const { reducer } = slice;
export { closeConversationErrorDialog };
