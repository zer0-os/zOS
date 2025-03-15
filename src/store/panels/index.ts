import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Panel } from './constants';

export type PanelsState = {
  openStates: Record<Panel, boolean>;
};

export const initialState: PanelsState = {
  openStates: {
    [Panel.FEED_CHAT]: true,
    [Panel.MEMBERS]: false,
  },
};

const slice = createSlice({
  name: 'panels',
  initialState,
  reducers: {
    togglePanel: (state, action: PayloadAction<Panel>) => {
      const panel = action.payload;
      state.openStates[panel] = !state.openStates[panel];
    },
    setPanelState: (state, action: PayloadAction<{ panel: Panel; isOpen: boolean }>) => {
      const { panel, isOpen } = action.payload;
      state.openStates[panel] = isOpen;
    },
    openPanel: (state, action: PayloadAction<Panel>) => {
      const panel = action.payload;
      state.openStates[panel] = true;
    },
    closePanel: (state, action: PayloadAction<Panel>) => {
      const panel = action.payload;
      state.openStates[panel] = false;
    },
  },
});

export const { togglePanel, setPanelState, openPanel, closePanel } = slice.actions;
export const { reducer } = slice;
