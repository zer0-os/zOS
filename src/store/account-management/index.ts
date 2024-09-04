import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Connectors } from '../../lib/web3';

export enum SagaActionTypes {
  AddNewWallet = 'Wallets/addNewWallet',
  AddEmailAccount = 'Wallets/addEmailAccount',
  OpenAddEmailAccountModal = 'Wallets/openAddEmailAccountModal',
  CloseAddEmailAccountModal = 'Wallets/closeAddEmailAccountModal',
}

export type AccountManagementState = {
  errors: string[];
  isAddEmailAccountModalOpen: boolean;
  successMessage: string;
};

export const initialState: AccountManagementState = {
  errors: [],
  isAddEmailAccountModalOpen: false,
  successMessage: '',
};

export enum Errors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const addNewWallet = createAction<{ connector: Connectors }>(SagaActionTypes.AddNewWallet);
export const addEmailAccount = createAction<{ email: string; password: string }>(SagaActionTypes.AddEmailAccount);
export const openAddEmailAccountModal = createAction(SagaActionTypes.OpenAddEmailAccountModal);
export const closeAddEmailAccountModal = createAction(SagaActionTypes.CloseAddEmailAccountModal);

const slice = createSlice({
  name: 'accountManagement',
  initialState,
  reducers: {
    setErrors: (state, action: PayloadAction<AccountManagementState['errors']>) => {
      state.errors = action.payload;
    },
    setAddEmailAccountModalStatus: (
      state,
      action: PayloadAction<AccountManagementState['isAddEmailAccountModalOpen']>
    ) => {
      state.isAddEmailAccountModalOpen = action.payload;
    },
    setSuccessMessage: (state, action: PayloadAction<AccountManagementState['successMessage']>) => {
      state.successMessage = action.payload;
    },
  },
});

export const { setErrors, setAddEmailAccountModalStatus, setSuccessMessage } = slice.actions;
export const { reducer } = slice;
