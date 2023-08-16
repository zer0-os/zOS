import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  RequestPasswordReset = 'requestPasswordReset',
  EnterRequestPasswordResetPage = 'enterRequestPasswordResetPage',
  LeaveRequestPasswordResetPage = 'leaveRequestPasswordResetPage',
}

export enum RequestPasswordResetStage {
  SubmitEmail = 'submit-email',
  Done = 'done',
}

export type RequestPasswordResetState = {
  loading: boolean;
  stage: RequestPasswordResetStage;
  errors: string[];
};

export enum ResetPasswordErrors {
  UNKNOWN_ERROR = 'UNKNOWN',
  API_ERROR = 'API_ERROR',
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
}

export const initialState: RequestPasswordResetState = {
  loading: false,
  stage: RequestPasswordResetStage.SubmitEmail,
  errors: [],
};

export const requestPasswordReset = createAction<{ email: string }>(SagaActionTypes.RequestPasswordReset);
export const enterResetPasswordPage = createAction(SagaActionTypes.EnterRequestPasswordResetPage);
export const leaveResetPasswordPage = createAction(SagaActionTypes.LeaveRequestPasswordResetPage);

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
    setStage: (state, action: PayloadAction<RequestPasswordResetState['stage']>) => {
      state.stage = action.payload;
    },
  },
});

export const { setLoading, setStage, setErrors } = slice.actions;
export const { reducer } = slice;
