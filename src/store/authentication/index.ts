import { Payload } from './saga';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  Authorize = 'authentication/saga/authorize',
}
const authorize = createAction<Payload>(SagaActionTypes.Authorize);

interface AuthenticationState {
  accessToken: string;
}
const initialState: AuthenticationState = {
  accessToken: null,
};

const slice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<AuthenticationState['accessToken']>) => {
      state.accessToken = action.payload;
    },
  },
});

export const { setAccessToken } = slice.actions;
export const { reducer } = slice;
export { authorize };
