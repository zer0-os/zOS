import {
  createSlice,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';

import { config } from '../../config';
import { apps, PlatformApp } from '../../lib/apps';

export enum SagaActionTypes {
  UpdateApp = 'app/saga/updateApp',
}

const setSelectedApp = createAction<string>(SagaActionTypes.UpdateApp);

export interface AppsState {
  selectedApp: PlatformApp,
}

const initialState: AppsState = {
  selectedApp: apps[config.defaultApp],
};

const slice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<PlatformApp>) => {
      state.selectedApp = action.payload;
    },
  },
});

export const { receive } = slice.actions;
export const { reducer } =  slice;
export { setSelectedApp };
