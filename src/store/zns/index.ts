import {
  createSlice,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';

import { config } from '../../config';

interface ZnsDomainDescriptor {
  route: string,
}

export enum SagaActionTypes {
  SetRoute = 'zns/saga/set-route',
}

export interface ZnsState {
  value: ZnsDomainDescriptor,
}

const setRoute = createAction(SagaActionTypes.SetRoute);

const initialState: ZnsState = {
  value: { route: config.defaultZnsRoute },
};

const slice = createSlice({
  name: 'zns',
  initialState,
  reducers: {
    receiveRoute: (state, action: PayloadAction<string>) => {
      state.value = { route: action.payload };
    },
    receive: (state, action: PayloadAction<ZnsDomainDescriptor>) => {
      state.value = action.payload;
    },
  },
});

export const { receive, receiveRoute } = slice.actions;
export const { reducer } =  slice;

export { setRoute };
