import { ChatState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ChatState = {
  chatAccessToken: {
    isLoading: false,
    value: null,
  },
  activeConversationId: null,
  joinRoomErrorContent: null,
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
    setJoinRoomErrorContent: (state, action: PayloadAction<ChatState['joinRoomErrorContent']>) => {
      state.joinRoomErrorContent = action.payload;
    },
    clearJoinRoomErrorContent: (state) => {
      state.joinRoomErrorContent = null;
    },
  },
});

export const { setChatAccessToken, rawSetActiveConversationId, setJoinRoomErrorContent, clearJoinRoomErrorContent } =
  slice.actions;
export const { reducer } = slice;
export { closeConversationErrorDialog };
