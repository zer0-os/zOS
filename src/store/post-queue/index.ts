import { createAction, createSlice } from '@reduxjs/toolkit';
import { SubmitPostParams } from '../../apps/feed/lib/useSubmitPost';

export interface QueuedPost {
  id: string;
  optimisticPost: any;
  params: SubmitPostParams;
  feedZid: string;
  replyToId?: string;
  status?: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

export type PostQueueState = QueuedPost[];

export const initialState: PostQueueState = [];

export const addQueuedPost = createAction<QueuedPost>('postQueue/addQueuedPost');
export const updateQueuedPostStatus = createAction<{
  tempId: string;
  status: 'pending' | 'confirmed' | 'failed';
  postId?: string;
  error?: string;
}>('postQueue/updateQueuedPostStatus');
export const removeQueuedPost = createAction<string>('postQueue/removeQueuedPost');

const slice = createSlice({
  name: 'postQueue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addQueuedPost, (state, action) => {
        state.push(action.payload);
      })
      .addCase(updateQueuedPostStatus, (state, action) => {
        const { tempId, status, error } = action.payload;
        const post = state.find((p) => p.id === tempId);
        if (post) {
          post.status = status;
          post.error = error;
        }
      })
      .addCase(removeQueuedPost, (state, action) => {
        return state.filter((p) => p.id !== action.payload);
      });
  },
});

export const { reducer } = slice;
