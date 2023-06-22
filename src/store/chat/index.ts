import { ChatState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
