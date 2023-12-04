import { PayloadAction, createAction, createSlice } from '@reduxjs/toolkit';

export enum SagaActionTypes {
  StartAddMember = 'group-management/start-add-member',
  Back = 'group-management/back',
  Cancel = 'group-management/cancel',
}

export const startAddGroupMember = createAction(SagaActionTypes.StartAddMember);
export const back = createAction(SagaActionTypes.Back);

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
