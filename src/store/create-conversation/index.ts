import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';
import { CreateMessengerConversation } from '../channels-list/types';
import { MembersSelectedPayload } from './types';

export enum SagaActionTypes {
  Start = 'create-conversation/start',
  Back = 'create-conversation/back',
  Cancel = 'create-conversation/cancel',
  MembersSelected = 'create-conversation/members-selected',
  CreateConversation = 'create-conversation/create',
}

export const startCreateConversation = createAction(SagaActionTypes.Start);
export const back = createAction(SagaActionTypes.Back);
export const membersSelected = createAction<MembersSelectedPayload>(SagaActionTypes.MembersSelected);
export const createConversation = createAction<CreateMessengerConversation>(SagaActionTypes.CreateConversation);

export enum Stage {
  None = 'none',
  InitiateConversation = 'initiate_conversation',
  GroupDetails = 'group_details',
}

type CreateConversationState = {
  stage: Stage;
  groupUsers: {
    value: string;
    label: string;
    image?: string;
  }[];
  startGroupChat: {
    isLoading: boolean;
  };
  groupDetails: {
    isCreating: boolean;
  };
};

const initialState: CreateConversationState = {
  stage: Stage.None,
  groupUsers: [],
  startGroupChat: {
    isLoading: false,
  },
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
    setFetchingConversations: (state, action: PayloadAction<boolean>) => {
      state.startGroupChat.isLoading = action.payload;
    },
    setGroupCreating: (state, action: PayloadAction<boolean>) => {
      state.groupDetails.isCreating = action.payload;
    },
    setGroupUsers: (state, action: PayloadAction<CreateConversationState['groupUsers']>) => {
      state.groupUsers = action.payload;
    },
  },
});

export const { setGroupCreating, setStage, setGroupUsers, setFetchingConversations } = slice.actions;
export const { reducer } = slice;
