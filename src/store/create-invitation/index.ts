import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  GetCode = 'create-invitation/get-code',
  Cancel = 'create-invitation/cancel',
}

export const fetchInvite = createAction(SagaActionTypes.GetCode);

export type CreateInvitationState = {
  code: string;
  url: string;
};

const initialState: CreateInvitationState = {
  code: '',
  url: '',
};

const slice = createSlice({
  name: 'createInvitation',
  initialState,
  reducers: {
    setInvite: (state, action: PayloadAction<CreateInvitationState>) => {
      state.code = action.payload.code;
      state.url = action.payload.url;
    },
    reset: (state, _action: PayloadAction) => {
      state.code = initialState.code;
      state.url = initialState.url;
    },
  },
});

export const { setInvite, reset } = slice.actions;
export const { reducer } = slice;
