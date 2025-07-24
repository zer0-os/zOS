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
  OpenZeroPro = 'user-profile/openZeroPro',
  CloseZeroProNotification = 'user-profile/closeZeroProNotification',
}

export enum Stage {
  None = 'none',
  Overview = 'overview',
  EditProfile = 'edit_profile',
  Settings = 'settings',
  AccountManagement = 'account_management',
  Downloads = 'downloads',
  LinkedAccounts = 'linked_accounts',
  ZeroPro = 'zero_pro',
}

export type UserProfileState = {
  stage: Stage;
  isPublicReadReceipts: boolean;
  showZeroProNotification: boolean;
};

export const initialState: UserProfileState = {
  stage: Stage.None,
  isPublicReadReceipts: null,
  showZeroProNotification: false,
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
export const openZeroPro = createAction(SagaActionTypes.OpenZeroPro);
export const closeZeroProNotification = createAction(SagaActionTypes.CloseZeroProNotification);

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
    setShowZeroProNotification: (state, action: PayloadAction<boolean>) => {
      state.showZeroProNotification = action.payload;
    },
  },
});

export const { setStage, setPublicReadReceipts, setShowZeroProNotification } = slice.actions;
export const { reducer } = slice;
