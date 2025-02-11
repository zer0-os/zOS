import { ChatState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ChatState = {
  activeConversationId: null,
  joinRoomErrorContent: null,
  isJoiningConversation: false,
  isChatConnectionComplete: false,
  isConversationsLoaded: false,
  isSecondaryConversationDataLoaded: false,
};

export enum SagaActionTypes {
  CloseConversationErrorDialog = 'chat/saga/closeConversationErrorDialog',
  setActiveConversationId = 'chat/saga/setActiveConversationId',
  SetIsJoiningConversation = 'chat/saga/setIsJoiningConversation',
  ValidateFeedChat = 'chat/saga/validateFeedChat',
}

const closeConversationErrorDialog = createAction(SagaActionTypes.CloseConversationErrorDialog);
export const setActiveConversationId = createAction<{ id: string }>(SagaActionTypes.setActiveConversationId);
export const validateFeedChat = createAction<{ id: string }>(SagaActionTypes.ValidateFeedChat);

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
    setIsSecondaryConversationDataLoaded: (
      state,
      action: PayloadAction<ChatState['isSecondaryConversationDataLoaded']>
    ) => {
      state.isSecondaryConversationDataLoaded = action.payload;
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
  setIsSecondaryConversationDataLoaded,
} = slice.actions;
export const { reducer } = slice;
export { closeConversationErrorDialog };
