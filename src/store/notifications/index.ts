import { createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  FetchNotifications = 'notifications/saga/fetchNotifications',
  OpenNotificationConversation = 'notifications/saga/openNotificationConversation',
  MarkNotificationsAsRead = 'notifications/saga/markNotificationsAsRead',
}

export interface Notification {
  id: string;
  type: 'reply' | 'mention' | 'direct_message' | 'reaction';
  roomId: string;
  createdAt: number;
  isRead?: boolean;
  sender?: {
    userId: string;
    firstName?: string;
    profileImage?: string;
  };
  content: {
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
export const markNotificationsAsRead = createAction<string>(SagaActionTypes.MarkNotificationsAsRead);

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

    markAsRead: (state, action) => {
      const roomId = action.payload;
      const hasUnreadNotifications = state.items.some(
        (notification) => notification.roomId === roomId && !notification.isRead
      );

      if (hasUnreadNotifications) {
        state.items = state.items.map((notification) => {
          if (notification.roomId === roomId) {
            return { ...notification, isRead: true };
          }
          return notification;
        });
      }
    },
  },
});

export const { setNotifications, setLoading, setError, markAsRead } = slice.actions;
export const { reducer } = slice;
