import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Wallet } from '../authentication/types';

export enum SagaActionTypes {
  AddNewWallet = 'Wallets/addNewWallet',
  ConfirmAddNewWallet = 'Wallets/confirmAddNewWallet',
  AddEmailAccount = 'Wallets/addEmailAccount',
  OpenAddEmailAccountModal = 'Wallets/openAddEmailAccountModal',
  CloseAddEmailAccountModal = 'Wallets/closeAddEmailAccountModal',
  Reset = 'Wallets/reset',
  RemoveWallet = 'Wallets/removeWallet',
  ConfirmRemoveWallet = 'Wallets/confirmRemoveWallet',
  CloseRemoveWalletModal = 'Wallets/closeRemoveWalletModal',
  FetchWallets = 'Wallets/fetchWallets',

  SetRemoveWalletModalStatus = 'accountManagement/setRemoveWalletModalStatus',
  SetWalletIdPendingRemoval = 'accountManagement/setWalletIdPendingRemoval',
  SetRemoveRequiresTransferConfirmation = 'accountManagement/setRemoveRequiresTransferConfirmation',
  SetErrors = 'accountManagement/setErrors',
  SetSuccessMessage = 'accountManagement/setSuccessMessage',
  SetIsRemovingWallet = 'accountManagement/setIsRemovingWallet',
  SetAddWalletCanAuthenticate = 'accountManagement/setAddWalletCanAuthenticate',
  SetAddWalletRequiresTransferConfirmation = 'accountManagement/setAddWalletRequiresTransferConfirmation',
  SetWallets = 'accountManagement/setWallets',
}

export type AccountManagementState = {
  state: State;
  errors: string[];
  isAddEmailAccountModalOpen: boolean;
  successMessage: string;
  // Remove wallet flow state
  isRemoveWalletModalOpen: boolean;
  walletIdPendingRemoval?: string;
  removeRequiresTransferConfirmation: boolean;
  isRemovingWallet: boolean;
  // Add wallet flow
  addWalletCanAuthenticate: boolean;
  addWalletRequiresTransferConfirmation: boolean;
  wallets: Wallet[];
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
  isRemoveWalletModalOpen: false,
  walletIdPendingRemoval: undefined,
  removeRequiresTransferConfirmation: false,
  isRemovingWallet: false,
  addWalletCanAuthenticate: true,
  addWalletRequiresTransferConfirmation: false,
  wallets: [],
};

export enum Errors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export const addNewWallet = createAction(SagaActionTypes.AddNewWallet);
export const confirmAddNewWallet = createAction(SagaActionTypes.ConfirmAddNewWallet);
export const removeWallet = createAction<{ walletId: string }>(SagaActionTypes.RemoveWallet);
export const confirmRemoveWallet = createAction<{ confirm?: boolean }>(SagaActionTypes.ConfirmRemoveWallet);
export const closeRemoveWalletModal = createAction(SagaActionTypes.CloseRemoveWalletModal);
export const addEmailAccount = createAction<{ email: string; password: string }>(SagaActionTypes.AddEmailAccount);
export const openAddEmailAccountModal = createAction(SagaActionTypes.OpenAddEmailAccountModal);
export const closeAddEmailAccountModal = createAction(SagaActionTypes.CloseAddEmailAccountModal);
export const reset = createAction(SagaActionTypes.Reset);
export const fetchWallets = createAction(SagaActionTypes.FetchWallets);

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
    setRemoveWalletModalStatus: (state, action: PayloadAction<AccountManagementState['isRemoveWalletModalOpen']>) => {
      state.isRemoveWalletModalOpen = action.payload;
    },
    setWalletIdPendingRemoval: (state, action: PayloadAction<AccountManagementState['walletIdPendingRemoval']>) => {
      state.walletIdPendingRemoval = action.payload;
    },
    setRemoveRequiresTransferConfirmation: (
      state,
      action: PayloadAction<AccountManagementState['removeRequiresTransferConfirmation']>
    ) => {
      state.removeRequiresTransferConfirmation = action.payload;
    },
    setIsRemovingWallet: (state, action: PayloadAction<AccountManagementState['isRemovingWallet']>) => {
      state.isRemovingWallet = action.payload;
    },
    setAddWalletCanAuthenticate: (state, action: PayloadAction<AccountManagementState['addWalletCanAuthenticate']>) => {
      state.addWalletCanAuthenticate = action.payload;
    },
    setAddWalletRequiresTransferConfirmation: (
      state,
      action: PayloadAction<AccountManagementState['addWalletRequiresTransferConfirmation']>
    ) => {
      state.addWalletRequiresTransferConfirmation = action.payload;
    },
    setWallets: (state, action: PayloadAction<AccountManagementState['wallets']>) => {
      state.wallets = action.payload || [];
    },
  },
});

export const {
  setErrors,
  setAddEmailAccountModalStatus,
  setSuccessMessage,
  setState,
  setRemoveWalletModalStatus,
  setWalletIdPendingRemoval,
  setRemoveRequiresTransferConfirmation,
  setIsRemovingWallet,
  setAddWalletCanAuthenticate,
  setAddWalletRequiresTransferConfirmation,
  setWallets,
} = slice.actions;
export const { reducer } = slice;
