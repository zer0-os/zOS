import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  ValidateInvite = 'registration/validateInvite',
}

export enum RegistrationStage {
  AcceptInvite = 'invite',
  Done = 'done',
}

export type RegistrationState = {
  stage: RegistrationStage;
  loading: boolean;

  isInviteValidated: boolean;
};

export const initialState: RegistrationState = {
  isInviteValidated: false,
  loading: false,
  stage: RegistrationStage.AcceptInvite,
};

export const validateInvite = createAction<{ code: string }>(SagaActionTypes.ValidateInvite);

const slice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setIsInviteCodeValid: (state, action: PayloadAction<RegistrationState['isInviteValidated']>) => {
      state.isInviteValidated = action.payload;
    },
    setLoading: (state, action: PayloadAction<RegistrationState['loading']>) => {
      state.loading = action.payload;
    },
    setStage: (state, action: PayloadAction<RegistrationState['stage']>) => {
      state.stage = action.payload;
    },
  },
});

export const { setIsInviteCodeValid, setLoading, setStage } = slice.actions;
export const { reducer } = slice;
