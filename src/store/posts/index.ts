import { Payload, PostPayload } from './saga';
import { createAction, createSlice } from '@reduxjs/toolkit';

import { Message } from '../messages';

export interface PostsResponse {
  hasMore: boolean;
  postMessages: Message[];
}

export enum SagaActionTypes {
  SendPostIrys = 'posts/saga/sendPostIrys',
  FetchPostsIrys = 'posts/saga/fetchPostsIrys',
  MeowPost = 'posts/saga/meowPost',
}

export type PostsState = {
  error?: string;
  isSubmitting: boolean;
};

export const initialState: PostsState = {
  error: undefined,
  isSubmitting: false,
};

export const sendPostIrys = createAction<PostPayload>(SagaActionTypes.SendPostIrys);
export const fetchPostsIrys = createAction<Payload>(SagaActionTypes.FetchPostsIrys);
export const meowPost = createAction<{
  postId: string;
  meowAmount: string;
  channelId: string;
}>(SagaActionTypes.MeowPost);

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
