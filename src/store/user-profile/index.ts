import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  OpenUserProfile = 'user-profile/openUserProfile',
  CloseUserProfile = 'user-profile/closeUserProfile',
  OpenEditProfile = 'user-profile/openEditProfile',
  OpenSettings = 'user-profile/openSettings',
}

export enum Stage {
  None = 'none',
  Overview = 'overview',
  EditProfile = 'edit_profile',
  Settings = 'settings',
}

export type UserProfileState = {
  stage: Stage;
};

export const initialState: UserProfileState = {
  stage: Stage.None,
};

export const openUserProfile = createAction(SagaActionTypes.OpenUserProfile);
export const closeUserProfile = createAction(SagaActionTypes.CloseUserProfile);
export const openEditProfile = createAction(SagaActionTypes.OpenEditProfile);
export const openSettings = createAction(SagaActionTypes.OpenSettings);

const slice = createSlice({
  name: 'user-profile',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<Stage>) => {
      state.stage = action.payload;
    },
  },
});

export const { setStage } = slice.actions;
export const { reducer } = slice;
