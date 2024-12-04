import { Payload, PostPayload } from './saga';
import { createAction, createSlice } from '@reduxjs/toolkit';

import { Message } from '../messages';

export interface PostsResponse {
  hasMore: boolean;
  postMessages: Message[];
}

export enum SagaActionTypes {
  SendPost = 'posts/saga/sendPost',
  FetchPosts = 'posts/saga/fetchPosts',
  MeowPost = 'posts/saga/meowPost',
  RefetchPosts = 'posts/saga/refetchPosts',
  PollPosts = 'posts/saga/pollPosts',
}

export type PostsState = {
  error?: string;
  isSubmitting: boolean;
  initialCount?: number;
  count?: number;
};

export const initialState: PostsState = {
  error: undefined,
  isSubmitting: false,
  initialCount: undefined,
  count: undefined,
};

export const sendPost = createAction<PostPayload>(SagaActionTypes.SendPost);
export const fetchPosts = createAction<Payload>(SagaActionTypes.FetchPosts);
export const meowPost = createAction<{
  postId: string;
  meowAmount: string;
  channelId: string;
}>(SagaActionTypes.MeowPost);
export const refetchPosts = createAction<{
  channelId: string;
}>(SagaActionTypes.RefetchPosts);
export const pollPosts = createAction<{
  channelId: string;
}>(SagaActionTypes.PollPosts);

const slice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
    setIsSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
    setInitialCount: (state, action) => {
      state.initialCount = action.payload;
    },
    setCount: (state, action) => {
      state.count = action.payload;
    },
  },
});

export const { setError, setIsSubmitting, setInitialCount, setCount } = slice.actions;
export const { reducer } = slice;
