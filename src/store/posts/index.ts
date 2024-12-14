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
  FetchPost = 'posts/saga/fetchPost',
}

export type PostsState = {
  error?: string;
  isSubmitting: boolean;
  initialCount?: number;
  count?: number;
  loadedPost?: Message;
  isLoadingPost: boolean;
};

export const initialState: PostsState = {
  error: undefined,
  isSubmitting: false,
  initialCount: undefined,
  count: undefined,
  isLoadingPost: false,
};

export const sendPost = createAction<PostPayload>(SagaActionTypes.SendPost);
export const fetchPosts = createAction<Payload>(SagaActionTypes.FetchPosts);
export const meowPost = createAction<{
  postId: string;
  meowAmount: string;
  channelId?: string;
}>(SagaActionTypes.MeowPost);
export const refetchPosts = createAction<{
  channelId: string;
}>(SagaActionTypes.RefetchPosts);
export const pollPosts = createAction<{
  channelId: string;
}>(SagaActionTypes.PollPosts);
export const fetchPost = createAction<{
  postId: string;
}>(SagaActionTypes.FetchPost);

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
    setPost: (state, action) => {
      state.loadedPost = action.payload;
    },
    setIsLoadingPost: (state, action) => {
      state.isLoadingPost = action.payload;
    },
  },
});

export const { setError, setIsSubmitting, setInitialCount, setCount, setPost, setIsLoadingPost } = slice.actions;
export const { reducer } = slice;
