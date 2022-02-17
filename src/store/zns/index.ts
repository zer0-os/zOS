import {
  createSlice,
  createAction,
  PayloadAction,
} from '@reduxjs/toolkit';

import { config } from '../../config';

export enum SagaActionTypes {
  UpdateRoute = 'zns/saga/updateRoute',
}

const setRoute = createAction<string>(SagaActionTypes.UpdateRoute);

interface ZnsDomainDescriptor {
  route: string,
  deepestVisitedRoute: string,
}

export interface ZnsState {
  value: ZnsDomainDescriptor,
}

const initialState: ZnsState = {
  value: {
    route: config.defaultZnsRoute,
    deepestVisitedRoute: config.defaultZnsRoute,
  },
};

const slice = createSlice({
  name: 'zns',
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<ZnsDomainDescriptor>) => {
      state.value = action.payload;
    },
  },
});

export const { receive } = slice.actions;
export const { reducer } =  slice;
export { setRoute };
