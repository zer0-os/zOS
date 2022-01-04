import {
  createSlice,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  ConnectionStatus,
  Connectors,
} from '../../lib/web3';

export enum SagaActionTypes {
  UpdateConnector = 'web3/saga/updateConnector',
}

const updateConnector = createAction(SagaActionTypes.UpdateConnector);

export interface Web3State {
  status: ConnectionStatus;
  value: {
    connector: Connectors,
  },
}

const initialState: Web3State = {
  status: ConnectionStatus.Disconnected,
  value: { connector: Connectors.None },
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
  },
});

export const { setConnectionStatus, setConnector } = slice.actions;
export const { reducer } =  slice;
export { updateConnector };
