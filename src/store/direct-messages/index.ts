import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DirectMessagesState } from './types';

export enum SagaActionTypes {
  Fetch = 'directMessages/saga/fetch',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);

const initialState: DirectMessagesState = {
  list: [],
  activeDirectMessageId: '',
};

const slice = createSlice({
  name: 'directMessages',
  initialState,
  reducers: {
    setDirectMessages: (state, action: PayloadAction<DirectMessagesState['list']>) => {
      state.list = action.payload;
    },
    setActiveDirectMessageId: (state, action: PayloadAction<string>) => {
      state.activeDirectMessageId = action.payload;
    },
  },
});

export const { setDirectMessages, setActiveDirectMessageId } = slice.actions;
export const { reducer } = slice;
export { fetch };
