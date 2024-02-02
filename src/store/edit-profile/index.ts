import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  EditProfile = 'profile/edit',
  LeaveGlobal = 'profile/edit/leaveGlobal',
  JoinGlobal = 'profile/edit/joinGlobal',
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
};

export const initialState: EditProfileState = {
  errors: [],
  state: State.NONE,
  ownedZIDs: [],
};

export const editProfile = createAction<{
  name: string;
  image: File | null;
  primaryZID: string;
}>(SagaActionTypes.EditProfile);

export const leaveGlobalNetwork = createAction(SagaActionTypes.LeaveGlobal);
export const joinGlobalNetwork = createAction(SagaActionTypes.JoinGlobal);
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
  },
});

export const { setErrors, startProfileEdit, setState, setOwnedZIDs } = slice.actions;
export const { reducer } = slice;
