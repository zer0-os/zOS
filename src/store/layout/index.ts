import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppLayout, LayoutState } from './types';

const initialState: LayoutState = {
  value: {
    isContextPanelOpen: false,
    hasContextPanel: false,
    isMessengerFullScreen: true,
  },
};

const slice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    update: (state, action: PayloadAction<Partial<AppLayout>>) => {
      state.value = {
        ...state.value,
        ...action.payload,
      };
    },
  },
});

export const { update } = slice.actions;
export const { reducer } = slice;
export { AppLayout, LayoutState };
