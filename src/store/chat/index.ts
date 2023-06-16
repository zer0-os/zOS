import { ChatState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  ReceiveIsReconnecting = 'chat/saga/receiveIsReconnecting',
  // XXX: remember to remove
  StartChat = 'chat/saga/startChat',
}

const receiveIsReconnecting = createAction<boolean>(SagaActionTypes.ReceiveIsReconnecting);
export const initChat = createAction<boolean>(SagaActionTypes.StartChat);

const initialState: ChatState = {
  chatAccessToken: {
    isLoading: false,
    value: null,
  },
  isReconnecting: false,
  activeConversationId: null,
};

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
    setactiveConversationId: (state, action: PayloadAction<ChatState['activeConversationId']>) => {
      state.activeConversationId = action.payload;
    },
  },
});

export const { setChatAccessToken, setReconnecting, setactiveConversationId } = slice.actions;
export const { reducer } = slice;
export { receiveIsReconnecting };
