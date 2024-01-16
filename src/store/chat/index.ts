import { ChatState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ChatState = {
  chatAccessToken: {
    isLoading: false,
    value: null,
  },
  activeConversationId: null,
  isConversationErrorDialogOpen: false,
};

export enum SagaActionTypes {
  CloseConversationErrorDialog = 'chat/saga/closeConversationErrorDialog',
}

const closeConversationErrorDialog = createAction(SagaActionTypes.CloseConversationErrorDialog);

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatAccessToken: (state, action: PayloadAction<ChatState['chatAccessToken']>) => {
      state.chatAccessToken = action.payload;
    },
    setActiveConversationId: (state, action: PayloadAction<ChatState['activeConversationId']>) => {
      state.activeConversationId = action.payload;
    },
    setIsConversationErrorDialogOpen: (state, action: PayloadAction<ChatState['isConversationErrorDialogOpen']>) => {
      state.isConversationErrorDialogOpen = action.payload;
    },
  },
});

export const { setChatAccessToken, setActiveConversationId, setIsConversationErrorDialogOpen } = slice.actions;
export const { reducer } = slice;
export { closeConversationErrorDialog };
