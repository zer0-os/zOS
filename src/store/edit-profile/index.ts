import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  EditProfile = 'profile/edit',
  FetchOwnedZIDs = 'profile/edit/fetchOwnedZIDs',
  OpenUserProfile = 'profile/edit/openUserProfile',
  CloseUserProfile = 'profile/edit/closeUserProfile',
}

export enum State {
  NONE,
  INPROGRESS,
  SUCCESS,
  LOADED,
}

export type EditProfileState = {
  errors: string[];
  state: State;
  ownedZIDs: string[];
  loadingZIDs: boolean;
  isUserProfileOpen: boolean;
};

export const initialState: EditProfileState = {
  errors: [],
  state: State.NONE,
  ownedZIDs: [],
  loadingZIDs: false,
  isUserProfileOpen: false,
};

export const editProfile = createAction<{
  name: string;
  image: File | null;
  primaryZID: string;
}>(SagaActionTypes.EditProfile);

export const fetchOwnedZIDs = createAction(SagaActionTypes.FetchOwnedZIDs);
export const openUserProfile = createAction(SagaActionTypes.OpenUserProfile);
export const closeUserProfile = createAction(SagaActionTypes.CloseUserProfile);

const slice = createSlice({
  name: 'edit-profile',
  initialState,
  reducers: {
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
    setIsUserProfileOpen: (state, action: PayloadAction<EditProfileState['isUserProfileOpen']>) => {
      state.isUserProfileOpen = action.payload;
    },
  },
});

export const { setErrors, startProfileEdit, setState, setOwnedZIDs, setLoadingZIDs, setIsUserProfileOpen } =
  slice.actions;
export const { reducer } = slice;
