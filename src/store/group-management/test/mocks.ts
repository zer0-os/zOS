import {
  GroupManagementState,
  LeaveGroupDialogStatus,
  MemberManagementAction,
  MemberManagementDialogStage,
  Stage,
} from '..';
import { EditConversationState } from '../types';

export const mockGroupManagementState: GroupManagementState = {
  isSecondarySidekickOpen: false,
  stage: Stage.None,
  isAddingMembers: false,
  addMemberError: null,
  leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
  errors: { editConversationErrors: { image: '', general: '' } },
  editConversationState: EditConversationState.NONE,
  memberManagement: {
    type: MemberManagementAction.None,
    userId: '',
    roomId: '',
    stage: MemberManagementDialogStage.CLOSED,
    error: '',
  },
};
