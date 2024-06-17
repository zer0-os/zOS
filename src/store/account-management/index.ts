import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Connectors } from '../../lib/web3';

export enum SagaActionTypes {
  AddNewWallet = 'Wallets/addNewWallet',
  AddEmailAccount = 'Wallets/addEmailAccount',
  OpenWalletSelectModal = 'Wallets/openWalletSelectModal',
  CloseWalletSelectModal = 'Wallets/closeWalletSelectModal',
  OpenAddEmailAccountModal = 'Wallets/openAddEmailAccountModal',
  CloseAddEmailAccountModal = 'Wallets/closeAddEmailAccountModal',
}

export type AccountManagementState = {
  errors: string[];
  isWalletSelectModalOpen: boolean;
  isAddEmailAccountModalOpen: boolean;
};

export const initialState: AccountManagementState = {
  errors: [],
  isWalletSelectModalOpen: false,
  isAddEmailAccountModalOpen: false,
};

export enum Errors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const addNewWallet = createAction<{ connector: Connectors }>(SagaActionTypes.AddNewWallet);
export const addEmailAccount = createAction<{ email: string; password: string }>(SagaActionTypes.AddEmailAccount);
export const openWalletSelectModal = createAction(SagaActionTypes.OpenWalletSelectModal);
export const closeWalletSelectModal = createAction(SagaActionTypes.CloseWalletSelectModal);
export const openAddEmailAccountModal = createAction(SagaActionTypes.OpenAddEmailAccountModal);
export const closeAddEmailAccountModal = createAction(SagaActionTypes.CloseAddEmailAccountModal);

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
    setAddEmailAccountModalStatus: (
      state,
      action: PayloadAction<AccountManagementState['isAddEmailAccountModalOpen']>
    ) => {
      state.isAddEmailAccountModalOpen = action.payload;
    },
  },
});

export const { setErrors, setWalletSelectModalStatus, setAddEmailAccountModalStatus } = slice.actions;
export const { reducer } = slice;
