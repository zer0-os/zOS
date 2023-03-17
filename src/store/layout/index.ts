import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import type { AppLayout, LayoutState, UpdateSidekickPayload } from './types';

export enum SagaActionTypes {
  updateSidekick = 'layout/saga/updateSidekick',
  syncSidekickState = 'layout/saga/syncSidekickState',
}

export const updateSidekick = createAction<UpdateSidekickPayload>(SagaActionTypes.updateSidekick);
export const syncSidekickState = createAction(SagaActionTypes.syncSidekickState);

const initialState: LayoutState = {
  value: {
    isContextPanelOpen: false,
    hasContextPanel: false,
    isSidekickOpen: false,
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
