import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { ConnectionStatus } from '../../lib/web3';

export interface Web3State {
  status: ConnectionStatus;
}

const initialState: Web3State = {
  status: ConnectionStatus.Disconnected,
};

const slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
    },
  },
});

export const { setConnectionStatus } = slice.actions;
export const { reducer } =  slice;
