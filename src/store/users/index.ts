import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Member } from '../authentication/types';

import { Payload } from './saga';

export enum SagaActionTypes {
  Fetch = 'users/saga/fetch',
}

const fetch = createAction<Payload>(SagaActionTypes.Fetch);

const initialState: any = {
  users: [],
};

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<Member[]>) => {
      state.users = action.payload;
    },
  },
});

export const { setUsers } = slice.actions;
export const { reducer } = slice;
export { fetch };
