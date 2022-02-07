import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { ViewModes } from '@zer0-os/zos-theme-engine';

export interface ThemeState {
  value: { viewMode: ViewModes };
}

const initialState: ThemeState = {
  value: { viewMode: ViewModes.Light },
};

const slice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<ViewModes>) => {
      state.value = { viewMode: action.payload };
    },
  },
});

export const { setViewMode } = slice.actions;
export const { reducer } =  slice;
