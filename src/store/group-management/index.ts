import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export interface MembersSelectedPayload {
  roomId: string;
  userIds: string[];
}

export enum SagaActionTypes {
  StartAddMember = 'group-management/start-add-member',
  StartEditConversation = 'group-management/start-edit-conversation',
  LeaveGroup = 'group-management/leave-group',
  Back = 'group-management/back',
  Cancel = 'group-management/cancel',
  AddSelectedMembers = 'group-management/add-selected-members',
  RemoveMember = 'group-management/remove-member',
}

export enum Stage {
  None = 'none',
  StartAddMemberToRoom = 'start_add_member_to_room',
  EditConversation = 'edit_conversation',
}

export enum LeaveGroupDialogStatus {
  OPEN,
  CLOSED,
  IN_PROGRESS,
}

export const leaveGroup = createAction<{ roomId: string }>(SagaActionTypes.LeaveGroup);
export const startAddGroupMember = createAction(SagaActionTypes.StartAddMember);
export const startEditConversation = createAction(SagaActionTypes.StartEditConversation);
export const back = createAction(SagaActionTypes.Back);
export const addSelectedMembers = createAction<MembersSelectedPayload>(SagaActionTypes.AddSelectedMembers);

export type GroupManagementState = {
  stage: Stage;
  isAddingMembers: boolean;
  addMemberError: string;
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
};

const initialState: GroupManagementState = {
  stage: Stage.None,
  isAddingMembers: false,
  addMemberError: null,
  leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
};

const slice = createSlice({
  name: 'groupManagement',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<Stage>) => {
      state.stage = action.payload;
    },
    setIsAddingMembers: (state, action: PayloadAction<GroupManagementState['isAddingMembers']>) => {
      state.isAddingMembers = action.payload;
    },
    setAddMemberError: (state, action: PayloadAction<GroupManagementState['addMemberError']>) => {
      state.addMemberError = action.payload;
    },
    setLeaveGroupStatus: (state, action: PayloadAction<GroupManagementState['leaveGroupDialogStatus']>) => {
      state.leaveGroupDialogStatus = action.payload;
    },
  },
});

export const { setAddMemberError, setStage, setIsAddingMembers, setLeaveGroupStatus } = slice.actions;
export const { reducer } = slice;
