import { AuthenticationState } from './types';
import { Payload } from './saga';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  NonceOrAuthorize = 'authentication/saga/nonceOrAuthorize',
  Terminate = 'authentication/saga/terminate',
  Logout = 'authentication/saga/logout',
  FetchCurrentUserWithChatAccessToken = 'authentication/saga/fetchCurrentUserWithChatAccessToken',
}

const nonceOrAuthorize = createAction<Payload>(SagaActionTypes.NonceOrAuthorize);
const terminate = createAction<Payload>(SagaActionTypes.Terminate);
export const logout = createAction(SagaActionTypes.Logout);
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
export { nonceOrAuthorize, terminate, fetchCurrentUserWithChatAccessToken };
