import { SIDEKICK_OPEN_STORAGE } from './constants';
import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import type { AppLayout, LayoutState, UpdateSidekickPayload } from './types';
import { resolveFromLocalStorageAsBoolean } from '../../lib/storage';

export enum SagaActionTypes {
  updateSidekick = 'layout/saga/updateSidekick',
}

export const updateSidekick = createAction<UpdateSidekickPayload>(SagaActionTypes.updateSidekick);

const initialState: LayoutState = {
  value: {
    isContextPanelOpen: false,
    isSidekickOpen: resolveFromLocalStorageAsBoolean(SIDEKICK_OPEN_STORAGE),
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
export { AppLayout, LayoutState, UpdateSidekickPayload };
