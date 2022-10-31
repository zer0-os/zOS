import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppLayout {
  scrollbarWidth: number;
  hasContextPanel: boolean;
  isContextPanelOpen: boolean;
}

export interface LayoutState {
  value: AppLayout;
}

const initialState: LayoutState = {
  value: {
    scrollbarWidth: 0,
    isContextPanelOpen: false,
    hasContextPanel: false,
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
