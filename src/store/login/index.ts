import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  EmailLogin = 'login/emailLogin',
}

export type LoginState = {
  stage: LoginStage;
  loading: boolean;
  errors: string[];
};

export enum LoginStage {
  EmailLogin = 'email',
  Done = 'done',
}

export enum EmailLoginErrors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  PROFILE_NOT_EXISTS = 'PROFILE_NOT_EXISTS',
  INVALID_EMAIL_PASSWORD = 'INVALID_EMAIL_PASSWORD',
}

export const initialState: LoginState = {
  stage: LoginStage.EmailLogin,
  loading: false,
  errors: [],
};

export const loginByEmail = createAction<{ email: string; password: string }>(SagaActionTypes.EmailLogin);

const slice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<LoginState['stage']>) => {
      state.stage = action.payload;
    },
    setLoading: (state, action: PayloadAction<LoginState['loading']>) => {
      state.loading = action.payload;
    },
    setErrors: (state, action: PayloadAction<LoginState['errors']>) => {
      state.errors = action.payload;
    },
  },
});

export const { setLoading, setErrors, setStage } = slice.actions;
export const { reducer } = slice;
