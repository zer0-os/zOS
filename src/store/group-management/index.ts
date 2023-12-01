import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  StartAddMember = 'group-management/start-add-member',
  LeaveGroup = 'group-management/leave-group',
  Back = 'group-management/back',
  Cancel = 'group-management/cancel',
}

export enum Stage {
  None = 'none',
  StartAddMemberToRoom = 'start_add_member_to_room',
}

export enum LeaveGroupDialogStatus {
  OPEN,
  CLOSED,
  IN_PROGRESS,
}

export const leaveGroup = createAction<{ roomId: string }>(SagaActionTypes.LeaveGroup);
export const startAddGroupMember = createAction(SagaActionTypes.StartAddMember);
export const back = createAction(SagaActionTypes.Back);

type GroupManagementState = {
  stage: Stage;
  leaveGroupDialogStatus: LeaveGroupDialogStatus;
};

const initialState: GroupManagementState = {
  stage: Stage.None,
  leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
};

const slice = createSlice({
  name: 'groupManagement',
  initialState,
  reducers: {
    setStage: (state, action: PayloadAction<Stage>) => {
      state.stage = action.payload;
    },
    setLeaveGroupStatus: (state, action: PayloadAction<GroupManagementState['leaveGroupDialogStatus']>) => {
      state.leaveGroupDialogStatus = action.payload;
    },
  },
});

export const { setStage, setLeaveGroupStatus } = slice.actions;
export const { reducer } = slice;
