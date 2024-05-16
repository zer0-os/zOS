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
  OpenMemberManagement = 'group-management/open-member-management',
  CancelMemberManageMent = 'group-management/cancel-member-management',
  RemoveMember = 'group-management/remove-member',
  EditConversationNameAndIcon = 'group-management/edit-conversation-name-and-icon',
  OpenViewGroupInformation = 'group-management/open-view-group-information',
  ToggleSecondarySidekick = 'group-management/toggle-secondary-sidekick',
}

export enum Stage {
  None = 'none',
  StartAddMemberToRoom = 'start_add_member_to_room',
  EditConversation = 'edit_conversation',
  ViewGroupInformation = 'view_group_information',
}

export enum LeaveGroupDialogStatus {
  OPEN,
  CLOSED,
  IN_PROGRESS,
}

export enum MemberManagementDialogStage {
  OPEN,
  CLOSED,
  IN_PROGRESS,
}

export enum MemberManagementAction {
  None = 'none',
  RemoveMember = 'remove_member',
  MakeModerator = 'make_moderator',
  RemoveModertor = 'remove_moderator',
}

export const leaveGroup = createAction<{ roomId: string }>(SagaActionTypes.LeaveGroup);
export const startAddGroupMember = createAction(SagaActionTypes.StartAddMember);
export const startEditConversation = createAction(SagaActionTypes.StartEditConversation);
export const back = createAction(SagaActionTypes.Back);
export const addSelectedMembers = createAction<MembersSelectedPayload>(SagaActionTypes.AddSelectedMembers);
export const openMemberManagement = createAction<{ type: MemberManagementAction; roomId: string; userId: string }>(
  SagaActionTypes.OpenMemberManagement
);
export const cancelMemberManagement = createAction(SagaActionTypes.CancelMemberManageMent);
export const removeMember = createAction<{ roomId: string; userId: string }>(SagaActionTypes.RemoveMember);
export const viewGroupInformation = createAction(SagaActionTypes.OpenViewGroupInformation);
export const editConversationNameAndIcon = createAction<EditConversationPayload>(
  SagaActionTypes.EditConversationNameAndIcon
);
export const toggleSecondarySidekick = createAction(SagaActionTypes.ToggleSecondarySidekick);

export type GroupManagementState = {
  stage: Stage;
  isAddingMembers: boolean;
  addMemberError: string;
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
  memberMangement: {
    type: MemberManagementAction;
    stage: MemberManagementDialogStage;
    userId: string;
    roomId: string;
    error: string;
  };
  errors: GroupManagementErrors;
  editConversationState: EditConversationState;
  isSecondarySidekickOpen: boolean;
};

export const initialState: GroupManagementState = {
  stage: Stage.None,
  isAddingMembers: false,
  addMemberError: null,
  leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
  errors: { editConversationErrors: { image: '', general: '' } },
  editConversationState: EditConversationState.NONE,
  memberMangement: {
    type: MemberManagementAction.None,
    userId: '',
    roomId: '',
    stage: MemberManagementDialogStage.CLOSED,
    error: '',
  },
  isSecondarySidekickOpen: false,
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
    setEditConversationImageError: (
      state,
      action: PayloadAction<GroupManagementState['errors']['editConversationErrors']['image']>
    ) => {
      state.errors.editConversationErrors.image = action.payload;
    },
    setEditConversationGeneralError: (
      state,
      action: PayloadAction<GroupManagementState['errors']['editConversationErrors']['general']>
    ) => {
      state.errors.editConversationErrors.general = action.payload;
    },
    setLeaveGroupStatus: (state, action: PayloadAction<GroupManagementState['leaveGroupDialogStatus']>) => {
      state.leaveGroupDialogStatus = action.payload;
    },
    setEditConversationState: (state, action: PayloadAction<GroupManagementState['editConversationState']>) => {
      state.editConversationState = action.payload;
    },
    setMemberManagement: (state, action: PayloadAction<GroupManagementState['memberMangement']>) => {
      state.memberMangement = action.payload;
    },
    setMemberManagementStage: (state, action: PayloadAction<GroupManagementState['memberMangement']['stage']>) => {
      state.memberMangement.stage = action.payload;
    },
    setMemberManagementError: (state, action: PayloadAction<GroupManagementState['memberMangement']['error']>) => {
      state.memberMangement.error = action.payload;
    },
    setSecondarySidekickOpen: (state, action: PayloadAction<GroupManagementState['isSecondarySidekickOpen']>) => {
      state.isSecondarySidekickOpen = action.payload;
    },
  },
});

export const {
  setAddMemberError,
  setStage,
  setIsAddingMembers,
  setLeaveGroupStatus,
  setEditConversationState,
  setEditConversationImageError,
  setEditConversationGeneralError,
  setMemberManagement,
  setMemberManagementStage,
  setMemberManagementError,
  setSecondarySidekickOpen,
} = slice.actions;
export const { reducer } = slice;
