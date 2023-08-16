import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  RequestPasswordReset = 'requestPasswordReset',
}

export type RequestPasswordResetState = {
  loading: boolean;
  errors: string[];
  emailSubmitted: boolean;
};

export enum ResetPasswordErrors {
  UNKNOWN_ERROR = 'UNKNOWN',
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
}

export const initialState: RequestPasswordResetState = {
  loading: false,
  errors: [],
  emailSubmitted: false,
};

export const resetPassword = createAction<{ email: string }>(SagaActionTypes.RequestPasswordReset);

const slice = createSlice({
  name: 'request-password-reset',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<RequestPasswordResetState['loading']>) => {
      state.loading = action.payload;
    },
    setErrors: (state, action: PayloadAction<RequestPasswordResetState['errors']>) => {
      state.errors = action.payload;
    },
    setEmailSubmitted: (state, action: PayloadAction<RequestPasswordResetState['emailSubmitted']>) => {
      state.emailSubmitted = action.payload;
    },
  },
});

export const { setLoading, setErrors, setEmailSubmitted } = slice.actions;
export const { reducer } = slice;
