import { ChatState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ChatState = {
  chatAccessToken: {
    isLoading: false,
    value: null,
  },
  isReconnecting: false,
  activeConversationId: null,
  activeChannelId: null,
  isErrorDialogOpen: false,
};

export enum SagaActionTypes {
  CloseErrorDialog = 'chat/saga/closeErrorDialog',
  ValidateActiveConversation = 'chat/saga/validateActiveConversation',
}

const closeErrorDialog = createAction(SagaActionTypes.CloseErrorDialog);
const validateActiveConversation = createAction(SagaActionTypes.ValidateActiveConversation);

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setReconnecting: (state, action: PayloadAction<ChatState['isReconnecting']>) => {
      state.isReconnecting = action.payload;
    },
    setChatAccessToken: (state, action: PayloadAction<ChatState['chatAccessToken']>) => {
      state.chatAccessToken = action.payload;
    },
    setActiveConversationId: (state, action: PayloadAction<ChatState['activeConversationId']>) => {
      state.activeConversationId = action.payload;
    },
    setIsErrorDialogOpen: (state, action: PayloadAction<ChatState['isErrorDialogOpen']>) => {
      state.isErrorDialogOpen = action.payload;
    },
  },
});

export const { setChatAccessToken, setReconnecting, setActiveConversationId, setIsErrorDialogOpen } = slice.actions;
export const { reducer } = slice;
export { closeErrorDialog, validateActiveConversation };
