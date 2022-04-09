import {
  createSlice,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';

import { config } from '../../config';

export enum SagaActionTypes {
  UpdateRoute = 'app/saga/updateRoute',
}

const setSelectedApp = createAction<string>(SagaActionTypes.UpdateRoute);

export interface AppsState {
  selectedApp: string,
}

const initialState: AppsState = {
  selectedApp: config.defaultApp,
};

const slice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<string>) => {
      state.selectedApp = action.payload;
    },
  },
});

export const { receive } = slice.actions;
export const { reducer } =  slice;
export { setSelectedApp };
