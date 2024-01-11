import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';
import { Chains, ConnectionStatus, Connectors } from '../../lib/web3';
import { WalletType } from '@zer0-os/zos-component-library';

export enum SagaActionTypes {
  UpdateConnector = 'web3/saga/updateConnector',
  SetAddress = 'web3/saga/setAddress',
  SetConnectionError = 'web3/saga/setConnectionError',
}

export const updateConnector = createAction<Connectors | WalletType>(SagaActionTypes.UpdateConnector);
export const setAddress = createAction<string>(SagaActionTypes.SetAddress);
export const setConnectionError = createAction<string>(SagaActionTypes.SetConnectionError);

export interface Web3State {
  status: ConnectionStatus;
  value: {
    chainId: Chains;
    address: string;
    connector: Connectors;
    error: string;
  };
}

const initialState: Web3State = {
  status: ConnectionStatus.Disconnected,
  value: { chainId: null, address: '', connector: Connectors.None, error: '' },
};

const slice = createSlice({
  name: 'web3',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
    },
    setConnector: (state, action: PayloadAction<Connectors>) => {
      state.value.connector = action.payload;
    },
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.value.address = action.payload;
    },
    setChain: (state, action: PayloadAction<Chains>) => {
      state.value.chainId = action.payload;
    },
    setWalletConnectionError: (state, action: PayloadAction<string>) => {
      state.value.error = action.payload;
    },
  },
});

export const { setConnector, setWalletAddress, setChain, setConnectionStatus, setWalletConnectionError } =
  slice.actions;
export const { reducer } = slice;
