import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Fetch = 'channels/saga/fetch',
}

const fetch = createAction<string>(SagaActionTypes.Fetch);

export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
}

export interface ChannelsState {
  status: ConnectionStatus;
  value: {
    account: string;
  };
}

const initialState: ChannelsState = {
  status: ConnectionStatus.Disconnected,
  value: { account: '' },
};

const slice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<ChannelsState>) => {
      const { value, status } = action.payload;

      state.value = value;
      state.status = status;
    },
    setStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
    },
  },
});

export const { receive, setStatus } = slice.actions;
export const { reducer } = slice;
export { fetch };
