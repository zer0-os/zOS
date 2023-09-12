import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PageloadState = {
  isComplete: boolean;
};

export const initialState = {
  isComplete: false,
  showAndroidDownload: false,
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
  },
});

export const { setIsComplete, setShowAndroidDownload } = slice.actions;
export const { reducer } = slice;
