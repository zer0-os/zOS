import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Connectors } from '../../lib/web3';

export enum SagaActionTypes {
  AddNewWallet = 'Wallets/addNewWallet',
  OpenWalletSelectModal = 'Wallets/openWalletSelectModal',
  CloseWalletSelectModal = 'Wallets/closeWalletSelectModal',
}

export type AccountManagementState = {
  errors: string[];
  isWalletSelectModalOpen: boolean;
};

export const initialState: AccountManagementState = {
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
  name: 'accountManagement',
  initialState,
  reducers: {
    setErrors: (state, action: PayloadAction<AccountManagementState['errors']>) => {
      state.errors = action.payload;
    },
    setWalletSelectModalStatus: (state, action: PayloadAction<AccountManagementState['isWalletSelectModalOpen']>) => {
      state.isWalletSelectModalOpen = action.payload;
    },
  },
});

export const { setErrors, setWalletSelectModalStatus } = slice.actions;
export const { reducer } = slice;
