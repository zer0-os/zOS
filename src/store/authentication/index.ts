import { AuthenticationState } from './types';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Logout = 'authentication/saga/logout',
  ForceLogout = 'authentication/saga/force-logout',
}

export const logout = createAction(SagaActionTypes.Logout);
export const forceLogout = createAction(SagaActionTypes.ForceLogout);

export const initialState: AuthenticationState = {
  user: { data: null },
  displayLogoutModal: false,
};

const slice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthenticationState['user']>) => {
      state.user = action.payload;
    },
    setDisplayLogoutModal: (state, action: PayloadAction<boolean>) => {
      state.displayLogoutModal = action.payload;
    },
  },
});

export const { setUser, setDisplayLogoutModal } = slice.actions;
export const { reducer } = slice;
