import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
//import { Connectors } from '../../lib/web3';

export enum SagaActionTypes {
  AddNewWallet = 'Wallets/addNewWallet',
  AddEmailAccount = 'Wallets/addEmailAccount',
  OpenAddEmailAccountModal = 'Wallets/openAddEmailAccountModal',
  CloseAddEmailAccountModal = 'Wallets/closeAddEmailAccountModal',
  Reset = 'Wallets/reset',
}

export type AccountManagementState = {
  state: State;
  errors: string[];
  isAddEmailAccountModalOpen: boolean;
  successMessage: string;
};

export enum State {
  NONE,
  INPROGRESS,
  LOADED,
}

export const initialState: AccountManagementState = {
  state: State.NONE,
  errors: [],
  isAddEmailAccountModalOpen: false,
  successMessage: '',
};

export enum Errors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const addNewWallet = createAction(SagaActionTypes.AddNewWallet);
export const addEmailAccount = createAction<{ email: string; password: string }>(SagaActionTypes.AddEmailAccount);
export const openAddEmailAccountModal = createAction(SagaActionTypes.OpenAddEmailAccountModal);
export const closeAddEmailAccountModal = createAction(SagaActionTypes.CloseAddEmailAccountModal);
export const reset = createAction(SagaActionTypes.Reset);

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
    setState: (state, action: PayloadAction<AccountManagementState['state']>) => {
      state.state = action.payload;
    },
    setSuccessMessage: (state, action: PayloadAction<AccountManagementState['successMessage']>) => {
      state.successMessage = action.payload;
    },
  },
});

export const { setErrors, setAddEmailAccountModalStatus, setSuccessMessage, setState } = slice.actions;
export const { reducer } = slice;
