import {
  createSlice,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';

import { config } from '../../config';
import { apps, PlatformApp, Apps } from '../../lib/apps';

export enum SagaActionTypes {
  UpdateApp = 'app/saga/updateApp',
}

const setSelectedApp = createAction<Apps>(SagaActionTypes.UpdateApp);

export interface AppsState {
  selectedApp: PlatformApp,
  hasOverlay: boolean,
  isOverlayOpen: boolean,
}

const initialState: AppsState = {
  selectedApp: apps[config.defaultApp],
  hasOverlay: false,
  isOverlayOpen: false,
};

const slice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<PlatformApp>) => {
      state.selectedApp = action.payload;
    },
    setOverlay: (state, action: PayloadAction<boolean>) => {
      state.hasOverlay = action.payload;
    },
    setOverlayOpen: (state, action: PayloadAction<boolean>) => {
      state.isOverlayOpen = action.payload;
    },
  },
});

export const { receive, setOverlay, setOverlayOpen } = slice.actions;
export const { reducer } =  slice;
export { setSelectedApp };
