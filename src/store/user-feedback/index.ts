import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  SubmitFeedback = 'users/submitFeedback',
}

export enum State {
  NONE,
  INPROGRESS,
  SUCCESS,
  LOADED,
}

export type UserFeedbackState = {
  state: State;
  error: string;
};

export const initialState: UserFeedbackState = {
  state: State.NONE,
  error: '',
};

export const submitFeedback = createAction<{}>(SagaActionTypes.SubmitFeedback);

const slice = createSlice({
  name: 'userFeedback',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<UserFeedbackState['state']>) => {
      state.state = action.payload;
    },
    setError: (state, action: PayloadAction<UserFeedbackState['error']>) => {
      state.error = action.payload;
    },
  },
});

export const { setState, setError } = slice.actions;
export const { reducer } = slice;
