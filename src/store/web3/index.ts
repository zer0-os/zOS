import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';
import { Chains, ConnectionStatus, Connectors } from '../../lib/web3';
import { WalletType } from '@zer0-os/zos-component-library';

export enum SagaActionTypes {
  UpdateConnector = 'web3/saga/updateConnector',
}

const updateConnector = createAction<Connectors | WalletType>(SagaActionTypes.UpdateConnector);

export interface Web3State {
  status: ConnectionStatus;
  value: {
    chainId: Chains;
    address: string;
    connector: Connectors;
    error: string;
  };
  isWalletModalOpen: boolean;
}

const initialState: Web3State = {
  status: ConnectionStatus.Disconnected,
  value: { chainId: null, address: '', connector: Connectors.None, error: '' },
  isWalletModalOpen: false,
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
    setAddress: (state, action: PayloadAction<string>) => {
      state.value.address = action.payload;
    },
    setChain: (state, action: PayloadAction<Chains>) => {
      state.value.chainId = action.payload;
    },
    setWalletModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isWalletModalOpen = action.payload;
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.value.error = action.payload;
    },
  },
});

export const { setConnector, setAddress, setChain, setConnectionStatus, setWalletModalOpen, setConnectionError } =
  slice.actions;
export const { reducer } = slice;
export { updateConnector };
