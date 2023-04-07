import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';
import { CreateMessengerConversation } from '../channels-list/types';

export enum SagaActionTypes {
  CreateConversation = 'create-conversation/create',
}

export const createConversation = createAction<CreateMessengerConversation>(SagaActionTypes.CreateConversation);

type CreateConversationState = {
  isActive: boolean;
  groupDetails: {
    isCreating: boolean;
  };
};

const initialState: CreateConversationState = {
  isActive: false,
  groupDetails: {
    isCreating: false,
  },
};

const slice = createSlice({
  name: 'createConversation',
  initialState,
  reducers: {
    setActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
    setGroupCreating: (state, action: PayloadAction<boolean>) => {
      state.groupDetails.isCreating = action.payload;
    },
  },
});

export const { setActive, setGroupCreating } = slice.actions;
export const { reducer } = slice;
