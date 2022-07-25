import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  UpdateRoute = 'zns/saga/updateRoute',
}

const setRoute = createAction<{ route: string; hasAppChanged: boolean }>(SagaActionTypes.UpdateRoute);

export interface ZnsDomainDescriptor {
  rootDomainId: string;
  route: string;
  deepestVisitedRoute: string;
}

export interface ZnsState {
  value: ZnsDomainDescriptor;
}

const initialState: ZnsState = {
  value: {
    rootDomainId: '',
    route: '',
    deepestVisitedRoute: '',
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
export const { reducer } = slice;
export { setRoute };
