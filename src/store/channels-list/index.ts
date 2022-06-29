import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Fetch = 'channelsList/saga/fetch',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);

export enum Status {
  Idle = 'idle',
  Fetching = 'fetching',
}

export interface ChannelsListState {
  status: Status;
  value: {
    account: string;
  };
}

const initialState: ChannelsListState = {
  status: Status.Idle,
  value: { account: '' },
};

const slice = createSlice({
  name: 'channelsList',
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<ChannelsListState>) => {
      const { value, status } = action.payload;

      state.value = value;
      state.status = status;
    },
    setStatus: (state, action: PayloadAction<Status>) => {
      state.status = action.payload;
    },
  },
});

export const { receive, setStatus } = slice.actions;
export const { reducer } = slice;
export { fetch };
