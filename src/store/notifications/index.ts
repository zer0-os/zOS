import { createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  FetchNotifications = 'notifications/saga/fetchNotifications',
  OpenNotificationConversation = 'notifications/saga/openNotificationConversation',
}

export interface Notification {
  id: string;
  type: 'reply' | 'mention' | 'direct_message' | 'reaction';
  roomId: string;
  createdAt: number;
  sender?: {
    userId: string;
    firstName?: string;
    profileImage?: string;
  };
  content?: {
    body?: string;
    replyToEventId?: string;
    reactionKey?: string;
    targetEventId?: string;
    amount?: number;
  };
}

export interface NotificationsState {
  items: Notification[];
  loading: boolean;
  error: string | null;
}

export const initialState: NotificationsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchNotifications = createAction(SagaActionTypes.FetchNotifications);
export const openNotificationConversation = createAction<string>(SagaActionTypes.OpenNotificationConversation);

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setNotifications, setLoading, setError } = slice.actions;
export const { reducer } = slice;
