import { AuthenticationState } from './types';
import { Payload } from './saga';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Authorize = 'authentication/saga/authorize',
  FetchCurrentUser = 'authentication/saga/fetchCurrentUser',
}
const authorize = createAction<Payload>(SagaActionTypes.Authorize);
const fetchCurrentUser = createAction<Payload>(SagaActionTypes.FetchCurrentUser);

const initialState: AuthenticationState = {
  user: null,
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
export { authorize, fetchCurrentUser };
