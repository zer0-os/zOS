import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PageloadState = {
  isComplete: boolean;
  entryPath: string;
  isZWalletReferrer: boolean;
};

export const initialState = {
  isComplete: false,
  showAndroidDownload: false,
  entryPath: '',
  isZWalletReferrer: false,
};

const slice = createSlice({
  name: 'pageload',
  initialState,
  reducers: {
    setIsComplete: (state, action: PayloadAction<PageloadState['isComplete']>) => {
      state.isComplete = action.payload;
    },
    setShowAndroidDownload: (state, action: PayloadAction<boolean>) => {
      state.showAndroidDownload = action.payload;
    },
    setEntryPath: (state, action: PayloadAction<PageloadState['entryPath']>) => {
      state.entryPath = action.payload;
    },
    setIsZWalletReferrer: (state, action: PayloadAction<boolean>) => {
      state.isZWalletReferrer = action.payload;
    },
  },
});

export const { setIsComplete, setShowAndroidDownload, setEntryPath, setIsZWalletReferrer } = slice.actions;
export const { reducer } = slice;
