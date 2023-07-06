import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PageloadState = {
  loadPage: boolean;
};

export const initialState = {
  loadPage: false,
};

const slice = createSlice({
  name: 'pageload',
  initialState,
  reducers: {
    setLoadPage: (state, action: PayloadAction<PageloadState['loadPage']>) => {
      state.loadPage = action.payload;
    },
  },
});

export const { setLoadPage } = slice.actions;
export const { reducer } = slice;
