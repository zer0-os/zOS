import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import { Recipient, TokenBalance } from '../../apps/wallet/types';
import { TxReceiptResponse } from '../../apps/wallet/queries/txReceiptQueryOptions';

export enum SendStage {
  Search = 'search',
  Token = 'token',
  Amount = 'amount',
  Confirm = 'confirm',
  Processing = 'processing',
  Broadcasting = 'broadcasting',
  Success = 'success',
  Error = 'error',
}

export enum SagaActionTypes {
  NextStage = 'wallet/saga/nextStage',
  PreviousStage = 'wallet/saga/previousStage',
  TransferToken = 'wallet/saga/transferToken',
}

export type WalletState = {
  selectedWallet: {
    address: string;
    label: string | null;
  };
  recipient: Recipient | null;
  sendStage: SendStage;
  token: TokenBalance | null;
  amount: string | null;
  txReceipt: TxReceiptResponse | null;
};

const initialState: WalletState = {
  selectedWallet: {
    address: '',
    label: null,
  },
  recipient: null,
  sendStage: SendStage.Search,
  token: null,
  amount: null,
  txReceipt: null,
};

const slice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setSelectedWallet: (state, action: PayloadAction<{ address: string; label: string | null }>) => {
      state.selectedWallet = action.payload;
    },
    setRecipient: (state, action: PayloadAction<Recipient>) => {
      state.recipient = action.payload;
    },
    setToken: (state, action: PayloadAction<TokenBalance>) => {
      state.token = action.payload;
    },
    setAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload;
    },
    setSendStage: (state, action: PayloadAction<SendStage>) => {
      state.sendStage = action.payload;
    },
    setTxReceipt: (state, action: PayloadAction<TxReceiptResponse>) => {
      state.txReceipt = action.payload;
    },
    reset: (state) => {
      state.recipient = initialState.recipient;
      state.sendStage = initialState.sendStage;
      state.token = initialState.token;
      state.amount = initialState.amount;
      state.txReceipt = initialState.txReceipt;
    },
  },
});

export const nextStage = createAction(SagaActionTypes.NextStage);
export const previousStage = createAction(SagaActionTypes.PreviousStage);
export const transferToken = createAction(SagaActionTypes.TransferToken);

export const { setSelectedWallet, setRecipient, setToken, setAmount, setSendStage, setTxReceipt, reset } =
  slice.actions;
export const { reducer } = slice;
