import { AuthenticationState } from './types';
import { Payload } from './saga';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  NonceOrAuthorize = 'authentication/saga/nonceOrAuthorize',
  ClearSession = 'authentication/saga/clearSession',
  FetchCurrentUserWithChatAccessToken = 'authentication/saga/fetchCurrentUserWithChatAccessToken',
}
const nonceOrAuthorize = createAction<Payload>(SagaActionTypes.NonceOrAuthorize);
const clearSession = createAction<Payload>(SagaActionTypes.ClearSession);
const fetchCurrentUserWithChatAccessToken = createAction<Payload>(SagaActionTypes.FetchCurrentUserWithChatAccessToken);

const initialState: AuthenticationState = {
  user: { data: null },
  loading: false,
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
export { nonceOrAuthorize, clearSession, fetchCurrentUserWithChatAccessToken };
