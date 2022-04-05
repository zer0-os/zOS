import {
  createSlice,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';

import { config } from '../../config';

export enum SagaActionTypes {
  UpdateRoute = 'app/saga/updateRoute',
}

const setRoute = createAction<string>(SagaActionTypes.UpdateRoute);

interface AppsDescriptor {
  route: string,
}

export interface AppsState {
  value: AppsDescriptor,
}

const initialState: AppsState = {
  value: {
    route: config.defaultApp,
  },
};

const slice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<AppsDescriptor>) => {
      state.value = action.payload;
    },
  },
});

export const { receive } = slice.actions;
export const { reducer } =  slice;
export { setRoute };
