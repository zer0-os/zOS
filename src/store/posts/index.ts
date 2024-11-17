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

export type PostsState = {};

export const initialState: PostsState = {};

export const sendPost = createAction<PostPayload>(SagaActionTypes.SendPost);
export const fetchPosts = createAction<Payload>(SagaActionTypes.FetchPosts);
export const sendPostIrys = createAction<PostPayload>(SagaActionTypes.SendPostIrys);
export const fetchPostsIrys = createAction<Payload>(SagaActionTypes.FetchPostsIrys);

const slice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
});

export const { reducer } = slice;
