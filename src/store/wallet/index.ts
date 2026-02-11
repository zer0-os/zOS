import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import { NFT, Recipient, TokenBalance } from '../../apps/wallet/types';
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
  TransferNft = 'wallet/saga/transferNft',
}

export type WalletState = {
  selectedWallet: {
    address: string;
    label: string | null;
  };
  recipient: Recipient | null;
  sendStage: SendStage;
  token: TokenBalance | null;
  nft: NFT | null;
  amount: string | null;
  txReceipt: TxReceiptResponse | null;
  error: boolean;
  errorCode: string | null;
};

const initialState: WalletState = {
  selectedWallet: {
    address: '',
    label: null,
  },
  recipient: null,
  sendStage: SendStage.Search,
  token: null,
  nft: null,
  amount: null,
  txReceipt: null,
  error: false,
  errorCode: null,
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
    setToken: (state, action: PayloadAction<TokenBalance | null>) => {
      state.token = action.payload;
    },
    setNft: (state, action: PayloadAction<NFT | null>) => {
      state.nft = action.payload;
    },
    setAmount: (state, action: PayloadAction<string | null>) => {
      state.amount = action.payload;
    },
    setSendStage: (state, action: PayloadAction<SendStage>) => {
      state.sendStage = action.payload;
    },
    setTxReceipt: (state, action: PayloadAction<TxReceiptResponse>) => {
      state.txReceipt = action.payload;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.error = action.payload;
    },
    setErrorCode: (state, action: PayloadAction<string>) => {
      state.errorCode = action.payload;
    },
    reset: (state) => {
      state.recipient = initialState.recipient;
      state.sendStage = initialState.sendStage;
      state.token = initialState.token;
      state.nft = initialState.nft;
      state.amount = initialState.amount;
      state.txReceipt = initialState.txReceipt;
      state.error = initialState.error;
    },
  },
});

export const nextStage = createAction(SagaActionTypes.NextStage);
export const previousStage = createAction(SagaActionTypes.PreviousStage);
export const transferToken = createAction(SagaActionTypes.TransferToken);
export const transferNft = createAction(SagaActionTypes.TransferNft);

export const {
  setSelectedWallet,
  setRecipient,
  setToken,
  setNft,
  setAmount,
  setSendStage,
  setTxReceipt,
  setError,
  setErrorCode,
  reset,
} = slice.actions;
export const { reducer } = slice;
