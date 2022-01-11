import {
  createSlice,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Model as FeedItem } from '../../apps/feed/feed-item';

export enum SagaActionTypes {
  Load = 'feed/saga/load',
}

const load = createAction(SagaActionTypes.Load);

export enum AsyncActionStatus {
  Idle = 'idle',
  Loading = 'loading',
  Failed = 'failed',
}

// change this to root asyncData<T> state or something.
export interface FeedState {
  value: FeedItem[];
  status: AsyncActionStatus;
}

const initialState: FeedState = {
  value: [],
  status: AsyncActionStatus.Idle,
};

const slice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<FeedItem[]>) => {
      state.value = action.payload;
    },
  },
});

export const { receive } = slice.actions;
export const { reducer } =  slice;

export { load };
