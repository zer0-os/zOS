import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';
import { CreateMessengerConversation } from '../channels-list/types';

export enum SagaActionTypes {
  Start = 'create-conversation/start',
  Forward = 'create-conversation/forward',
  Back = 'create-conversation/back',
  Reset = 'create-conversation/reset',
  CreateConversation = 'create-conversation/create',
}

export const startCreateConversation = createAction(SagaActionTypes.Start);
// Temporarily just let the component guide the saga through the stages.
export const forward = createAction(SagaActionTypes.Forward);
export const back = createAction(SagaActionTypes.Back);
export const reset = createAction(SagaActionTypes.Reset);
export const createConversation = createAction<CreateMessengerConversation>(SagaActionTypes.CreateConversation);

export enum Stage {
  None = 'none',
  CreateOneOnOne = 'one_on_one',
  StartGroupChat = 'start_group',
  GroupDetails = 'group_details',
}

type CreateConversationState = {
  stage: Stage;
  isActive: boolean;
  groupDetails: {
    isCreating: boolean;
  };
};

const initialState: CreateConversationState = {
  stage: Stage.None,
  isActive: false,
  groupDetails: {
    isCreating: false,
  },
};

const slice = createSlice({
  name: 'createConversation',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<Stage>) => {
      state.stage = action.payload;
    },
    setActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
    setGroupCreating: (state, action: PayloadAction<boolean>) => {
      state.groupDetails.isCreating = action.payload;
    },
  },
});

export const { setActive, setGroupCreating, setStage } = slice.actions;
export const { reducer } = slice;
