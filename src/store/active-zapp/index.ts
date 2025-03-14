import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';
import { ZAppManifest } from '../../apps/external-app/types/manifest';

export enum SagaActionTypes {
  SetActiveZAppManifest = 'active-zapp/set-active-zapp-manifest',
  ClearActiveZAppManifest = 'active-zapp/clear-active-zapp-manifest',
}

export const setActiveZAppManifest = createAction<ZAppManifest>(SagaActionTypes.SetActiveZAppManifest);
export const clearActiveZAppManifest = createAction(SagaActionTypes.ClearActiveZAppManifest);

export type ActiveZAppState = {
  manifest: ZAppManifest | null;
};

export const initialState: ActiveZAppState = {
  manifest: null,
};

const slice = createSlice({
  name: 'active-zapp',
  initialState,
  reducers: {
    setActiveZAppManifest: (state, action: PayloadAction<ZAppManifest>) => {
      state.manifest = action.payload;
    },
    clearActiveZAppManifest: (state) => {
      state.manifest = null;
    },
  },
});

export const {
  setActiveZAppManifest: setActiveZAppManifestAction,
  clearActiveZAppManifest: clearActiveZAppManifestAction,
} = slice.actions;
export const { reducer } = slice;
