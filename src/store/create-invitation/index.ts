import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  GetCode = 'create-conversation/get-code',
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
  },
});

export const { setInvite } = slice.actions;
export const { reducer } = slice;
