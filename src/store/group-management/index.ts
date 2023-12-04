import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export interface MembersSelectedPayload {
  roomId: string;
  users: any[];
}

export enum SagaActionTypes {
  StartAddMember = 'group-management/start-add-member',
  Back = 'group-management/back',
  Cancel = 'group-management/cancel',
  AddSelectedMembers = 'group-management/add-selected-members',
}

export const startAddGroupMember = createAction(SagaActionTypes.StartAddMember);
export const back = createAction(SagaActionTypes.Back);
export const addSelectedMembersToRoom = createAction<MembersSelectedPayload>(SagaActionTypes.AddSelectedMembers);

export enum Stage {
  None = 'none',
  StartAddMemberToRoom = 'start_add_member_to_room',
}

type GroupManagementState = {
  stage: Stage;
};

const initialState: GroupManagementState = {
  stage: Stage.None,
};

const slice = createSlice({
  name: 'groupManagement',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<Stage>) => {
      state.stage = action.payload;
    },
  },
});

export const { setStage } = slice.actions;
export const { reducer } = slice;
