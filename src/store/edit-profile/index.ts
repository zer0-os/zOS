import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  EditProfile = 'profile/edit',
}

export type EditProfileState = {
  loading: boolean;
  errors: string[];
  changesSaved: boolean;
};

export const initialState: EditProfileState = {
  loading: false,
  errors: [],
  changesSaved: false,
};

export const editProfile = createAction<{ name: string; image: File | null }>(SagaActionTypes.EditProfile);

const slice = createSlice({
  name: 'edit-profile',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<EditProfileState['loading']>) => {
      state.loading = action.payload;
    },
    setChangesSaved: (state, action: PayloadAction<EditProfileState['changesSaved']>) => {
      state.changesSaved = action.payload;
    },
    setErrors: (state, action: PayloadAction<EditProfileState['errors']>) => {
      state.errors = action.payload;
    },
  },
});

export const { setLoading, setErrors, setChangesSaved } = slice.actions;
export const { reducer } = slice;
