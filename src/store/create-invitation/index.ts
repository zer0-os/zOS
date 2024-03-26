import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  GetCode = 'create-invitation/get-code',
  Cancel = 'create-invitation/cancel',
}

export const fetchInvite = createAction(SagaActionTypes.GetCode);
export const clearInvite = createAction(SagaActionTypes.Cancel);

export type CreateInvitationState = {
  code: string;
  url: string;
  isLoading: boolean;
};

const initialState: CreateInvitationState = {
  code: '',
  url: '',
  isLoading: false,
};

const slice = createSlice({
  name: 'createInvitation',
  initialState,
  reducers: {
    setInviteDetails: (state, action: PayloadAction<Omit<CreateInvitationState, 'isLoading'>>) => {
      state.code = action.payload.code;
      state.url = action.payload.url;
    },
    setLoading: (state, action: PayloadAction<CreateInvitationState['isLoading']>) => {
      state.isLoading = action.payload;
    },
    reset: (state, _action: PayloadAction) => {
      state.code = initialState.code;
      state.url = initialState.url;
    },
  },
});

export const { setInviteDetails, setLoading, reset } = slice.actions;
export const { reducer } = slice;
