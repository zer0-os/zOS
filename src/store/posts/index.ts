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
}

export type PostsState = {
  error?: string;
  isSubmitting: boolean;
};

export const initialState: PostsState = {
  error: undefined,
  isSubmitting: false,
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
  },
});

export const { setError, setIsSubmitting } = slice.actions;
export const { reducer } = slice;
