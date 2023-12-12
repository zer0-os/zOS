import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import type { AppLayout, LayoutState } from './types';

export enum SagaActionTypes {
  enterFullScreenMessenger = 'layout/saga/enterFullScreenMessenger',
}

export const enterFullScreenMessenger = createAction<{ isOpen: boolean }>(SagaActionTypes.enterFullScreenMessenger);

const initialState: LayoutState = {
  value: {
    isContextPanelOpen: false,
    hasContextPanel: false,
    isSidekickOpen: false,
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
    exitFullScreenMessenger: (state, _action: PayloadAction) => {
      state.value = {
        ...state.value,
        isMessengerFullScreen: false,
      };
    },
  },
});

export const { update, exitFullScreenMessenger } = slice.actions;
export const { reducer } = slice;
export { AppLayout, LayoutState };
