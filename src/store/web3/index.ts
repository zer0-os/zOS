import {
  createSlice,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  ConnectionStatus,
  Connectors,
} from '../../lib/web3';
import { WalletType } from '@zer0-os/zos-component-library';

export enum SagaActionTypes {
  UpdateConnector = 'web3/saga/updateConnector',
}

const updateConnector = createAction<Connectors | WalletType>(SagaActionTypes.UpdateConnector);

export interface Web3State {
  status: ConnectionStatus;
  value: {
    address: string,
    connector: Connectors,
    isNotSupportedNetwork: boolean,
  },
}

const initialState: Web3State = {
  status: ConnectionStatus.Disconnected,
  value: { address: '', connector: Connectors.None, isNotSupportedNetwork: false },
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
    setIsNotSupportedNetwork: (state, action: PayloadAction<boolean>) => {
      state.value.isNotSupportedNetwork = action.payload;
    },
  },
});

export const { setConnector, setAddress, setConnectionStatus, setIsNotSupportedNetwork } = slice.actions;
export const { reducer } =  slice;
export { updateConnector };
