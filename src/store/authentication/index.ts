import { AuthenticationState } from './types';
import { Payload } from './saga';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Logout = 'authentication/saga/logout',
  FetchCurrentUserWithChatAccessToken = 'authentication/saga/fetchCurrentUserWithChatAccessToken',
}

export const logout = createAction(SagaActionTypes.Logout);
const fetchCurrentUserWithChatAccessToken = createAction<Payload>(SagaActionTypes.FetchCurrentUserWithChatAccessToken);

const initialState: AuthenticationState = {
  user: { data: null },
};

const slice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthenticationState['user']>) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = slice.actions;
export const { reducer } = slice;
export { fetchCurrentUserWithChatAccessToken };
