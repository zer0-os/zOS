import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';
import { EditConversationState, GroupManagementErrors } from './types';

export interface MembersSelectedPayload {
  roomId: string;
  users: any[];
}

export interface EditConversationPayload {
  name: string;
  image: File | null;
  roomId: string;
}

export enum SagaActionTypes {
  StartAddMember = 'group-management/start-add-member',
  StartEditConversation = 'group-management/start-edit-conversation',
  LeaveGroup = 'group-management/leave-group',
  Back = 'group-management/back',
  Cancel = 'group-management/cancel',
  AddSelectedMembers = 'group-management/add-selected-members',
  RemoveMember = 'group-management/remove-member',
  EditConversationNameAndIcon = 'group-management/edit-conversation-name-and-icon',
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
export const removeMember = createAction<{ roomId: string; userId: string }>(SagaActionTypes.RemoveMember);
export const editConversationNameAndIcon = createAction<EditConversationPayload>(
  SagaActionTypes.EditConversationNameAndIcon
);

export type GroupManagementState = {
  stage: Stage;
  isAddingMembers: boolean;
  addMemberError: string;
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
  errors: GroupManagementErrors;
  editConversationState: EditConversationState;
};

const initialState: GroupManagementState = {
  stage: Stage.None,
  isAddingMembers: false,
  addMemberError: null,
  leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
  errors: {},
  editConversationState: EditConversationState.NONE,
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
    setEditConversationErrors: (
      state,
      action: PayloadAction<GroupManagementState['errors']['editConversationErrors']>
    ) => {
      state.errors.editConversationErrors = {
        ...state.errors.editConversationErrors,
        ...action.payload,
      };
    },
    setLeaveGroupStatus: (state, action: PayloadAction<GroupManagementState['leaveGroupDialogStatus']>) => {
      state.leaveGroupDialogStatus = action.payload;
    },
    setEditConversationState: (state, action: PayloadAction<GroupManagementState['editConversationState']>) => {
      state.editConversationState = action.payload;
    },
  },
});

export const {
  setAddMemberError,
  setStage,
  setIsAddingMembers,
  setLeaveGroupStatus,
  setEditConversationState,
  setEditConversationErrors,
} = slice.actions;
export const { reducer } = slice;
