import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Connector } from 'wagmi';

export enum SagaActionTypes {
  EmailLogin = 'login/emailLogin',
  OTPLogin = 'login/otpLogin',
  OTPVerify = 'login/otpVerify',
  Web3Login = 'login/web3Login',
  OAuthLogin = 'login/oauthLogin',
  SwitchLoginStage = 'login/switchLoginStage',
}

export enum OTPStage {
  Login = 'login',
  Verify = 'verify',
}

export type LoginState = {
  stage: LoginStage;
  otpStage: OTPStage;
  loading: boolean;
  errors: string[];
  link: string | null; // OAuth link provider to redirect to
  next: string | null; // Next page to redirect to after login
};

export enum LoginStage {
  EmailLogin = 'email',
  OTPLogin = 'otp',
  Web3Login = 'web3',
  SocialLogin = 'social',
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
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export type LoginByEmailPayload = {
  email: string;
  password: string;
};

export type LoginByOTPPayload = {
  email: string;
};

export type VerifyOTPPayload = {
  email: string;
  code: string;
};

export const initialState: LoginState = {
  stage: LoginStage.Web3Login,
  otpStage: OTPStage.Login,
  loading: false,
  link: null,
  next: null,
  errors: [],
};

export const loginByEmail = createAction<LoginByEmailPayload>(SagaActionTypes.EmailLogin);
export const loginByOTP = createAction<LoginByOTPPayload>(SagaActionTypes.OTPLogin);
export const verifyOTPCode = createAction<VerifyOTPPayload>(SagaActionTypes.OTPVerify);
export const loginByWeb3 = createAction<Connector['id']>(SagaActionTypes.Web3Login);
export const loginByOAuth = createAction<string>(SagaActionTypes.OAuthLogin);
export const switchLoginStage = createAction<LoginStage>(SagaActionTypes.SwitchLoginStage);

const slice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<LoginState['stage']>) => {
      state.stage = action.payload;
    },
    setOTPStage: (state, action: PayloadAction<OTPStage>) => {
      state.otpStage = action.payload;
    },
    setLoading: (state, action: PayloadAction<LoginState['loading']>) => {
      state.loading = action.payload;
    },
    setErrors: (state, action: PayloadAction<LoginState['errors']>) => {
      state.errors = action.payload;
    },
    setLink: (state, action: PayloadAction<LoginState['link']>) => {
      state.link = action.payload;
    },
    setNext: (state, action: PayloadAction<LoginState['next']>) => {
      state.next = action.payload;
    },
    reset: () => initialState,
  },
});

export const { setLoading, setErrors, setStage, setOTPStage, setLink, setNext, reset } = slice.actions;
export const { reducer } = slice;
