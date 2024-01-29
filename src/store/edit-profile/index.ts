import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  EditProfile = 'profile/edit',
  LeaveGlobal = 'profile/edit/leaveGlobal',
  JoinGlobal = 'profile/edit/joinGlobal',
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
};

export const initialState: EditProfileState = {
  errors: [],
  state: State.NONE,
};

export const editProfile = createAction<{
  name: string;
  image: File | null;
  primaryZID: string;
}>(SagaActionTypes.EditProfile);

export const leaveGlobalNetwork = createAction(SagaActionTypes.LeaveGlobal);
export const joinGlobalNetwork = createAction(SagaActionTypes.JoinGlobal);

const slice = createSlice({
  name: 'edit-profile',
  initialState,
  reducers: {
    startProfileEdit: (state, _action: PayloadAction) => {
      state.errors = [];
      state.state = State.NONE;
    },
    setErrors: (state, action: PayloadAction<EditProfileState['errors']>) => {
      state.errors = action.payload;
    },
    setState: (state, action: PayloadAction<EditProfileState['state']>) => {
      state.state = action.payload;
    },
  },
});

export const { setErrors, startProfileEdit, setState } = slice.actions;
export const { reducer } = slice;
