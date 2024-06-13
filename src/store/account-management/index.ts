import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Connectors } from '../../lib/web3';

export enum SagaActionTypes {
  AddNewWallet = 'Wallets/addNewWallet',
  OpenWalletSelectModal = 'Wallets/openWalletSelectModal',
  CloseWalletSelectModal = 'Wallets/closeWalletSelectModal',
}

export type WalletsState = {
  errors: string[];
  isWalletSelectModalOpen: boolean;
};

export const initialState: WalletsState = {
  errors: [],
  isWalletSelectModalOpen: false,
};

export enum Errors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const addNewWallet = createAction<{ connector: Connectors }>(SagaActionTypes.AddNewWallet);
export const openWalletSelectModal = createAction(SagaActionTypes.OpenWalletSelectModal);
export const closeWalletSelectModal = createAction(SagaActionTypes.CloseWalletSelectModal);

const slice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    setErrors: (state, action: PayloadAction<WalletsState['errors']>) => {
      state.errors = action.payload;
    },
    setWalletSelectModalStatus: (state, action: PayloadAction<WalletsState['isWalletSelectModalOpen']>) => {
      state.isWalletSelectModalOpen = action.payload;
    },
  },
});

export const { setErrors, setWalletSelectModalStatus } = slice.actions;
export const { reducer } = slice;
