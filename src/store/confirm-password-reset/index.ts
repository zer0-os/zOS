import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  UpdatePassword = 'confirm-reset-password/updatePassword',
  EnterConfirmPasswordResetPage = 'enterConfirmPasswordResetPage',
  LeaveConfirmPasswordResetPage = 'leaveConfirmPasswordResetPage',
}

export enum ConfirmPasswordResetStage {
  SubmitNewPassword = 'submit-new-password',
  Done = 'done',
}

export type ConfirmPasswordResetState = {
  loading: boolean;
  stage: ConfirmPasswordResetStage;
  errors: string[];
};

export enum ConfirmPasswordResetErrors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  PASSWORD_INVALID = 'PASSWORD_INVALID',
}

export const initialState: ConfirmPasswordResetState = {
  loading: false,
  stage: ConfirmPasswordResetStage.SubmitNewPassword,
  errors: [],
};

export const updatePassword = createAction<{ password: string }>(SagaActionTypes.UpdatePassword);
export const enterConfirmPasswordResetPage = createAction(SagaActionTypes.EnterConfirmPasswordResetPage);
export const leaveConfirmPasswordResetPage = createAction(SagaActionTypes.LeaveConfirmPasswordResetPage);

const slice = createSlice({
  name: 'confirm-password-reset',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<ConfirmPasswordResetState['loading']>) => {
      state.loading = action.payload;
    },
    setErrors: (state, action: PayloadAction<ConfirmPasswordResetState['errors']>) => {
      state.errors = action.payload;
    },
    setStage: (state, action: PayloadAction<ConfirmPasswordResetState['stage']>) => {
      state.stage = action.payload;
    },
  },
});

export const { setLoading, setStage, setErrors } = slice.actions;
export const { reducer } = slice;
