import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  EditProfile = 'profile/edit',
  FetchOwnedZIDs = 'profile/edit/fetchOwnedZIDs',
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
};

export const initialState: EditProfileState = {
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
  },
});

export const { setErrors, startProfileEdit, setState, setOwnedZIDs, setLoadingZIDs } = slice.actions;
export const { reducer } = slice;
