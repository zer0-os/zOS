import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PageloadState = {
  isComplete: boolean;
  entryPath: string;
};

export const initialState = {
  isComplete: false,
  showAndroidDownload: false,
  entryPath: '',
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
  },
});

export const { setIsComplete, setShowAndroidDownload, setEntryPath } = slice.actions;
export const { reducer } = slice;
