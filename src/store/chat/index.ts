import { ChatState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ChatState = {
  chatAccessToken: {
    isLoading: false,
    value: null,
  },
  activeConversationId: null,
  isConversationErrorDialogOpen: false,
  joinRoomErrorContent: null,
};

export enum SagaActionTypes {
  CloseConversationErrorDialog = 'chat/saga/closeConversationErrorDialog',
  ValidateAndSetActiveConversationId = 'channelsList/saga/ValidateAndSetActiveConversationId',
}

const closeConversationErrorDialog = createAction(SagaActionTypes.CloseConversationErrorDialog);
export const validateAndSetActiveConversationId = createAction<{ id: string }>(
  SagaActionTypes.ValidateAndSetActiveConversationId
);

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
    setJoinRoomErrorContent: (state, action: PayloadAction<ChatState['joinRoomErrorContent']>) => {
      state.joinRoomErrorContent = action.payload;
    },
  },
});

export const {
  setChatAccessToken,
  setActiveConversationId,
  setIsConversationErrorDialogOpen,
  setJoinRoomErrorContent,
} = slice.actions;
export const { reducer } = slice;
export { closeConversationErrorDialog };
