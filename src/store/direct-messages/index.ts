import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AsyncListStatus } from '../normalized';
import { DirectMessagesState } from './types';

export enum SagaActionTypes {
  Fetch = 'directMessages/saga/fetch',
  StartSyncDirectMessage = 'directMessages/saga/StartSyncDirectMessage',
  StopSyncDirectMessage = 'directMessages/saga/StopSyncDirectMessage',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);
const startSyncDirectMessage = createAction<string>(SagaActionTypes.StartSyncDirectMessage);
const stopSyncDirectMessage = createAction<string>(SagaActionTypes.StopSyncDirectMessage);

const initialState: DirectMessagesState = {
  list: [],
  activeDirectMessageId: '',
  syncStatus: AsyncListStatus.Idle,
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
    setSyncStatus: (state, action: PayloadAction<AsyncListStatus>) => {
      state.syncStatus = action.payload;
    },
  },
});

export const { setDirectMessages, setActiveDirectMessageId, setSyncStatus } = slice.actions;
export const { reducer } = slice;
export { fetch, startSyncDirectMessage, stopSyncDirectMessage };
