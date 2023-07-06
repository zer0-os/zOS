import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PageloadState = {
  isComplete: boolean;
};

export const initialState = {
  isComplete: false,
};

const slice = createSlice({
  name: 'pageload',
  initialState,
  reducers: {
    setIsComplete: (state, action: PayloadAction<PageloadState['isComplete']>) => {
      state.isComplete = action.payload;
    },
  },
});

export const { setIsComplete } = slice.actions;
export const { reducer } = slice;
