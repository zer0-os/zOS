import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  ValidateInvite = 'registration/validateInvite',
}

export enum RegistrationStage {
  ValidateInvite = 'invite',
  Done = 'done',
}

// referenced from zero_api
export enum InviteCodeStatus {
  VALID = 'VALID',
  INVITE_CODE_NOT_FOUND = 'INVITE_CODE_NOT_FOUND',
  INVITE_CODE_CANCELED = 'INVITE_CODE_CANCELED',
  INVITE_CODE_USED = 'INVITE_CODE_USED',
  INVITE_CODE_EXPIRED = 'INVITE_CODE_EXPIRED',
}

export type RegistrationState = {
  stage: RegistrationStage;
  loading: boolean;

  inviteStatus: string;
};

export const initialState: RegistrationState = {
  inviteStatus: InviteCodeStatus.VALID,
  loading: false,
  stage: RegistrationStage.ValidateInvite,
};

export const validateInvite = createAction<{ code: string }>(SagaActionTypes.ValidateInvite);

const slice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setInviteStatus: (state, action: PayloadAction<RegistrationState['inviteStatus']>) => {
      state.inviteStatus = action.payload;
    },
    setLoading: (state, action: PayloadAction<RegistrationState['loading']>) => {
      state.loading = action.payload;
    },
    setStage: (state, action: PayloadAction<RegistrationState['stage']>) => {
      state.stage = action.payload;
    },
  },
});

export const { setInviteStatus, setLoading, setStage } = slice.actions;
export const { reducer } = slice;
