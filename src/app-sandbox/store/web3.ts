import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { ConnectionStatus } from '../../lib/web3';

export interface Web3State {
  status: ConnectionStatus;
  value: {
    address: string,
  },
}

const initialState: Web3State = {
  status: ConnectionStatus.Disconnected,
  value: { address: '' },
};

const slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.value.address = action.payload;
    },
  },
});

export const { setConnectionStatus, setAddress } = slice.actions;
export const { reducer } =  slice;
