import { ChatState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ChatState = {
  chatAccessToken: {
    isLoading: false,
    value: null,
  },
  isReconnecting: false,
  activeConversationId: null,
  activeChannelId: null,
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
    setActiveConversationId: (state, action: PayloadAction<ChatState['activeConversationId']>) => {
      state.activeConversationId = action.payload;
    },
    setActiveChannelId: (state, action: PayloadAction<ChatState['activeChannelId']>) => {
      state.activeChannelId = action.payload;
    },
  },
});

export const { setChatAccessToken, setReconnecting, setActiveConversationId, setActiveChannelId } = slice.actions;
export const { reducer } = slice;
