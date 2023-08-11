import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  ResetPassword = 'resetPassword',
}

export type ResetState = {
  loading: boolean;
  errors: string[];
  emailSubmitted: boolean;
};

export enum ResetPasswordErrors {
  UNKNOWN_ERROR = 'UNKNOWN',
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
}

export const initialState: ResetState = {
  loading: false,
  errors: [],
  emailSubmitted: false,
};

export const resetPassword = createAction<{ email: string }>(SagaActionTypes.ResetPassword);

const slice = createSlice({
  name: 'reset-password',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<ResetState['loading']>) => {
      state.loading = action.payload;
    },
    setErrors: (state, action: PayloadAction<ResetState['errors']>) => {
      state.errors = action.payload;
    },
    setEmailSubmitted: (state, action: PayloadAction<ResetState['emailSubmitted']>) => {
      state.emailSubmitted = action.payload;
    },
  },
});

export const { setLoading, setErrors, setEmailSubmitted } = slice.actions;
export const { reducer } = slice;
