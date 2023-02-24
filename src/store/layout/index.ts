import { SIDEKICK_OPEN_STORAGE } from './constants';
import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import type { AppLayout, LayoutState, UpdateSidekickPayload, SetActiveSidekickTabPayload } from './types';
import { resolveFromLocalStorageAsBoolean } from '../../lib/storage';
import { resolveActiveTab } from './utils';

export enum SagaActionTypes {
  updateSidekick = 'layout/saga/updateSidekick',
  setActiveSidekickTab = 'layout/saga/setActiveSidekickTab',
}

export const updateSidekick = createAction<UpdateSidekickPayload>(SagaActionTypes.updateSidekick);
export const setActiveSidekickTab = createAction<SetActiveSidekickTabPayload>(SagaActionTypes.setActiveSidekickTab);

const initialState: LayoutState = {
  value: {
    isContextPanelOpen: false,
    isSidekickOpen: resolveFromLocalStorageAsBoolean(SIDEKICK_OPEN_STORAGE),
    hasContextPanel: false,
    activeSidekickTab: resolveActiveTab(),
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
export { AppLayout, LayoutState, UpdateSidekickPayload, SetActiveSidekickTabPayload };
