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
  errors: string[];

  inviteCodeStatus: string;
  profileId: string;
  inviteCode: string;
};

export enum AccountCreationErrors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  EMAIL_REQUIRED = 'EMAIL_REQUIRED',
  EMAIL_INVALID = 'EMAIL_INVALID',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  PASSWORD_INVALID = 'PASSWORD_INVALID',
}

export enum ProfileDetailsErrors {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NAME_REQUIRED = 'NAME_REQUIRED',
}

export const initialState: RegistrationState = {
  inviteCodeStatus: InviteCodeStatus.VALID,
  loading: false,
  stage: RegistrationStage.ValidateInvite,
  errors: [],

  profileId: '',
  inviteCode: '',
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
    setLoading: (state, action: PayloadAction<RegistrationState['loading']>) => {
      state.loading = action.payload;
    },
    setStage: (state, action: PayloadAction<RegistrationState['stage']>) => {
      state.stage = action.payload;
    },
    setErrors: (state, action: PayloadAction<RegistrationState['errors']>) => {
      state.errors = action.payload;
    },
    setProfileId: (state, action: PayloadAction<RegistrationState['profileId']>) => {
      state.profileId = action.payload;
    },
    setInviteCode: (state, action: PayloadAction<RegistrationState['inviteCode']>) => {
      state.inviteCode = action.payload;
    },
  },
});

export const { setInviteStatus, setLoading, setStage, setErrors, setProfileId, setInviteCode } = slice.actions;
export const { reducer } = slice;
