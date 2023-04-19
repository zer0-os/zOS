import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  ValidateInvite = 'registration/validateInvite',
  CreateAccount = 'registration/createAccount',
  UpdateProfile = 'registration/updateProfile',
}

export enum RegistrationStage {
  ValidateInvite = 'invite',
  AccountCreation = 'creation',
  ProfileDetails = 'details',
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

  inviteCodeStatus: string;
  name: string;
};
export const initialState: RegistrationState = {
  inviteCodeStatus: InviteCodeStatus.VALID,
  loading: false,
  stage: RegistrationStage.ValidateInvite,

  name: '',
};

export const validateInvite = createAction<{ code: string }>(SagaActionTypes.ValidateInvite);
export const createAccount = createAction<{ email: string; password: string }>(SagaActionTypes.CreateAccount);
export const updateProfile = createAction<{ name: string }>(SagaActionTypes.UpdateProfile);

const slice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setInviteStatus: (state, action: PayloadAction<RegistrationState['inviteCodeStatus']>) => {
      state.inviteCodeStatus = action.payload;
    },
    setName: (state, action: PayloadAction<RegistrationState['name']>) => {
      state.name = action.payload;
    },
    setLoading: (state, action: PayloadAction<RegistrationState['loading']>) => {
      state.loading = action.payload;
    },
    setStage: (state, action: PayloadAction<RegistrationState['stage']>) => {
      state.stage = action.payload;
    },
  },
});

export const { setInviteStatus, setName, setLoading, setStage } = slice.actions;
export const { reducer } = slice;
