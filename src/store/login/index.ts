import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Connectors } from '../../lib/web3';

export enum SagaActionTypes {
  EmailLogin = 'login/emailLogin',
  Web3Login = 'login/web3Login',
  SwitchLoginStage = 'login/switchLoginStage',
}

export type LoginState = {
  stage: LoginStage;
  loading: boolean;
  errors: string[];
};

export enum LoginStage {
  EmailLogin = 'email',
  Web3Login = 'web3',
}

export enum EmailLoginErrors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  PROFILE_NOT_EXISTS = 'PROFILE_NOT_EXISTS',
  INVALID_EMAIL_PASSWORD = 'INVALID_EMAIL_PASSWORD',
}

export enum Web3LoginErrors {
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
}

export const initialState: LoginState = {
  stage: LoginStage.Web3Login,
  loading: false,
  errors: [],
};

export const loginByEmail = createAction<{ email: string; password: string }>(SagaActionTypes.EmailLogin);
export const loginByWeb3 = createAction<Connectors>(SagaActionTypes.Web3Login);
export const switchLoginStage = createAction<LoginStage>(SagaActionTypes.SwitchLoginStage);

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
    reset: () => initialState,
  },
});

export const { setLoading, setErrors, setStage, reset } = slice.actions;
export const { reducer } = slice;
