import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  GetCode = 'create-invitation/get-code',
  Cancel = 'create-invitation/cancel',
}

export const fetchInvite = createAction(SagaActionTypes.GetCode);

export type CreateInvitationState = {
  code: string;
  url: string;
  invitesUsed: number;
  maxInvitesPerUser: number;
};

const initialState: CreateInvitationState = {
  code: '',
  url: '',
  invitesUsed: 0,
  maxInvitesPerUser: 0,
};

const slice = createSlice({
  name: 'createInvitation',
  initialState,
  reducers: {
    setInvite: (state, action: PayloadAction<CreateInvitationState>) => {
      state.code = action.payload.code;
      state.url = action.payload.url;
      state.invitesUsed = action.payload.invitesUsed;
      state.maxInvitesPerUser = action.payload.maxInvitesPerUser;
    },
    reset: (state, _action: PayloadAction) => {
      state.code = initialState.code;
      state.url = initialState.url;
      state.invitesUsed = initialState.invitesUsed;
      state.maxInvitesPerUser = initialState.maxInvitesPerUser;
    },
  },
});

export const { setInvite, reset } = slice.actions;
export const { reducer } = slice;
