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
  setActiveConversationId = 'chat/saga/setActiveConversationId',
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
    setIsConversationErrorDialogOpen: (state, action: PayloadAction<ChatState['isConversationErrorDialogOpen']>) => {
      state.isConversationErrorDialogOpen = action.payload;
    },
  },
});

export const { setChatAccessToken, rawSetActiveConversationId, setIsConversationErrorDialogOpen } = slice.actions;
export const { reducer } = slice;
export { closeConversationErrorDialog };
