import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  OpenUserProfile = 'user-profile/openUserProfile',
  CloseUserProfile = 'user-profile/closeUserProfile',
  OpenEditProfile = 'user-profile/openEditProfile',
  OpenSettings = 'user-profile/openSettings',
  OpenDownloads = 'user-profile/openDownloads',
  OpenAccountManagement = 'user-profile/openAccountManagement',
  OpenLinkedAccounts = 'user-profile/openLinkedAccounts',
  PrivateReadReceipts = 'user-profile/privateReadReceipts',
  PublicReadReceipts = 'user-profile/publicReadReceipts',
}

export enum Stage {
  None = 'none',
  Overview = 'overview',
  EditProfile = 'edit_profile',
  Settings = 'settings',
  AccountManagement = 'account_management',
  Downloads = 'downloads',
  LinkedAccounts = 'linked_accounts',
}

export type UserProfileState = {
  stage: Stage;
  isPublicReadReceipts: boolean;
};

export const initialState: UserProfileState = {
  stage: Stage.None,
  isPublicReadReceipts: null,
};

export const openUserProfile = createAction(SagaActionTypes.OpenUserProfile);
export const closeUserProfile = createAction(SagaActionTypes.CloseUserProfile);
export const openEditProfile = createAction(SagaActionTypes.OpenEditProfile);
export const openSettings = createAction(SagaActionTypes.OpenSettings);
export const openDownloads = createAction(SagaActionTypes.OpenDownloads);
export const openAccountManagement = createAction(SagaActionTypes.OpenAccountManagement);
export const openLinkedAccounts = createAction(SagaActionTypes.OpenLinkedAccounts);
export const privateReadReceipts = createAction(SagaActionTypes.PrivateReadReceipts);
export const publicReadReceipts = createAction(SagaActionTypes.PublicReadReceipts);

const slice = createSlice({
  name: 'user-profile',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<Stage>) => {
      state.stage = action.payload;
    },
    setPublicReadReceipts: (state, action: PayloadAction<boolean>) => {
      state.isPublicReadReceipts = action.payload;
    },
  },
});

export const { setStage, setPublicReadReceipts } = slice.actions;
export const { reducer } = slice;
