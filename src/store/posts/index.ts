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
  isSubmitting: boolean;
};

export const initialState: PostsState = {
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
    setIsSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
  },
});

export const { setIsSubmitting } = slice.actions;
export const { reducer } = slice;
