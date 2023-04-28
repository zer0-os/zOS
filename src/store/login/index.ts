import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  EmailLogin = 'login/emailLogin',
}

export type LoginState = {
  loading: boolean;
  errors: string[];
};

export enum EmailLoginErrors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
}

export const initialState: LoginState = {
  loading: false,
  errors: [],
};

export const loginByEmail = createAction<{ email: string; password: string }>(SagaActionTypes.EmailLogin);

const slice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<LoginState['loading']>) => {
      state.loading = action.payload;
    },
    setErrors: (state, action: PayloadAction<LoginState['errors']>) => {
      state.errors = action.payload;
    },
  },
});

export const { setLoading, setErrors } = slice.actions;
export const { reducer } = slice;
