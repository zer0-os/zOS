import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FetchUsersPayload } from './saga';

export interface UserMentions {
  handle: string;
  id: string;
  name: string;
  profileImage: string;
  rank: number;
  summary: string;
  type: string;
}

export enum SagaActionTypes {
  Fetch = 'users/saga/fetch',
}

const fetch = createAction<FetchUsersPayload>(SagaActionTypes.Fetch);

const initialState: any = {
  users: [],
};

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<UserMentions[]>) => {
      state.users = action.payload;
    },
  },
});

export const { setUsers } = slice.actions;
export const { reducer } = slice;
export { fetch };
