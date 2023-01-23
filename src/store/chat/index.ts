import { ChatState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  FetchChatAccessToken = 'chat/saga/fetchChatAccessToken',
  ReceiveIsReconnecting = 'chat/saga/receiveIsReconnecting',
}

const fetchChatAccessToken = createAction(SagaActionTypes.FetchChatAccessToken);
const receiveIsReconnecting = createAction<boolean>(SagaActionTypes.ReceiveIsReconnecting);

const initialState: ChatState = {
  chatAccessToken: {
    isLoading: false,
    value: '',
  },
  isReconnecting: false,
  activeChannelId: '',
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
  },
});

export const { setChatAccessToken, setReconnecting } = slice.actions;
export const { reducer } = slice;
export { fetchChatAccessToken, receiveIsReconnecting };
