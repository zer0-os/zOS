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
  SendPostIrys = 'posts/saga/sendPostIrys',
  FetchPostsIrys = 'posts/saga/fetchPostsIrys',
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
export const sendPostIrys = createAction<PostPayload>(SagaActionTypes.SendPostIrys);
export const fetchPostsIrys = createAction<Payload>(SagaActionTypes.FetchPostsIrys);

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
