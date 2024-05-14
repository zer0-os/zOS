import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  EditProfile = 'profile/edit',
  FetchOwnedZIDs = 'profile/edit/fetchOwnedZIDs',
  OpenUserProfile = 'profile/edit/openUserProfile',
  CloseUserProfile = 'profile/edit/closeUserProfile',
  OpenEditProfile = 'profile/edit/openEditProfile',
}

export enum State {
  NONE,
  INPROGRESS,
  SUCCESS,
  LOADED,
}

export enum Stage {
  None = 'none',
  Overview = 'overview',
  EditProfile = 'edit_profile',
}

export type EditProfileState = {
  stage: Stage;
  errors: string[];
  state: State;
  ownedZIDs: string[];
  loadingZIDs: boolean;
};

export const initialState: EditProfileState = {
  stage: Stage.None,
  errors: [],
  state: State.NONE,
  ownedZIDs: [],
  loadingZIDs: false,
};

export const editProfile = createAction<{
  name: string;
  image: File | null;
  primaryZID: string;
}>(SagaActionTypes.EditProfile);

export const fetchOwnedZIDs = createAction(SagaActionTypes.FetchOwnedZIDs);
export const openUserProfile = createAction(SagaActionTypes.OpenUserProfile);
export const closeUserProfile = createAction(SagaActionTypes.CloseUserProfile);
export const openEditProfile = createAction(SagaActionTypes.OpenEditProfile);

const slice = createSlice({
  name: 'edit-profile',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<Stage>) => {
      state.stage = action.payload;
    },
    startProfileEdit: (state, _action: PayloadAction) => {
      state.errors = [];
      state.state = State.NONE;
      state.ownedZIDs = [];
    },
    setErrors: (state, action: PayloadAction<EditProfileState['errors']>) => {
      state.errors = action.payload;
    },
    setState: (state, action: PayloadAction<EditProfileState['state']>) => {
      state.state = action.payload;
    },
    setOwnedZIDs: (state, action: PayloadAction<EditProfileState['ownedZIDs']>) => {
      state.ownedZIDs = action.payload;
    },
    setLoadingZIDs: (state, action: PayloadAction<EditProfileState['loadingZIDs']>) => {
      state.loadingZIDs = action.payload;
    },
  },
});

export const { setErrors, startProfileEdit, setState, setStage, setOwnedZIDs, setLoadingZIDs } = slice.actions;
export const { reducer } = slice;
