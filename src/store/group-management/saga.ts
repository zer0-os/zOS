import { call, fork, put, take, select, takeLatest } from 'redux-saga/effects';
import {
  Chat,
  chat,
  setUserAsModerator as matrixSetUserAsModerator,
  removeUserAsModerator as matrixRemoveUserAsModerator,
  uploadFile,
} from '../../lib/chat';
import { Events, getAuthChannel } from '../authentication/channels';
import { denormalize as denormalizeUsers } from '../users';
import { currentUserSelector } from '../authentication/saga';
import {
  SagaActionTypes,
  Stage,
  setAddMemberError,
  setStage,
  setIsAddingMembers,
  LeaveGroupDialogStatus,
  setLeaveGroupStatus,
  setEditConversationState,
  setEditConversationGeneralError,
  setEditConversationImageError,
  setMemberManagement,
  MemberManagementDialogStage,
  setMemberManagementStage,
  setMemberManagementError,
  setSecondarySidekickOpen,
  MemberManagementAction,
} from './index';
import { EditConversationState } from './types';
import { isSecondarySidekickOpenSelector } from './selectors';
import { closeOverview as closeMessageInfo } from '../message-info/saga';
import { rawChannelSelector } from '../channels/saga';

export function* reset() {
  yield put(setStage(Stage.None));
  yield put(setIsAddingMembers(false));
  yield put(setAddMemberError(null));
  yield put(setEditConversationState(EditConversationState.NONE));
  yield put(setEditConversationImageError(''));
  yield put(setEditConversationGeneralError(''));

  yield call(closeMessageInfo);
}

export function* saga() {
  yield fork(authWatcher);
  yield takeLatest(SagaActionTypes.LeaveGroup, leaveGroup);

  yield takeLatest(SagaActionTypes.Back, resetConversationManagement);
  yield takeLatest(SagaActionTypes.StartAddMember, startAddGroupMember);
  yield takeLatest(SagaActionTypes.AddSelectedMembers, roomMembersSelected);
  yield takeLatest(SagaActionTypes.EditConversationNameAndIcon, editConversationNameAndIcon);
  yield takeLatest(SagaActionTypes.StartEditConversation, startEditConversation);
  yield takeLatest(SagaActionTypes.OpenMemberManagement, openMemberManagementDialog);
  yield takeLatest(SagaActionTypes.CancelMemberManageMent, cancelMemberManageMent);
  yield takeLatest(SagaActionTypes.RemoveMember, removeMember);
  yield takeLatest(SagaActionTypes.SetMemberAsModerator, setMemberAsModerator);
  yield takeLatest(SagaActionTypes.RemoveMemberAsModerator, removeMemberAsModerator);
  yield takeLatest(SagaActionTypes.OpenViewGroupInformation, openViewGroupInformation);
  yield takeLatest(SagaActionTypes.ToggleSecondarySidekick, toggleIsSecondarySidekick);
}

export function* resetConversationManagement() {
  // Future: may need to track which stage we were in and move back to a different stage
  // For now, we just reset to the start
  yield call(reset);
}

export function* startAddGroupMember() {
  const isSidekickOpen = yield select(isSecondarySidekickOpenSelector);

  if (!isSidekickOpen) {
    yield call(reset);
    yield put(setSecondarySidekickOpen(true));
  }

  yield put(setStage(Stage.StartAddMemberToRoom));
}

export function* startEditConversation() {
  const isSidekickOpen = yield select(isSecondarySidekickOpenSelector);

  if (!isSidekickOpen) {
    yield call(reset);
    yield put(setSecondarySidekickOpen(true));
  }
  yield put(setStage(Stage.EditConversation));
}

function* authWatcher() {
  const channel = yield call(getAuthChannel);
  while (true) {
    yield take(channel, Events.UserLogout);
    yield call(reset);
  }
}

export function* leaveGroup(action) {
  try {
    yield put(setLeaveGroupStatus(LeaveGroupDialogStatus.IN_PROGRESS));

    const currentUser = yield select(currentUserSelector());
    const chatClient = yield call(chat.get);
    yield call([chatClient, chatClient.leaveRoom], action.payload.roomId, currentUser.id);

    return;
  } catch (e) {
    // probably handle this..?
  } finally {
    yield put(setLeaveGroupStatus(LeaveGroupDialogStatus.CLOSED));
  }
}

export function* roomMembersSelected(action) {
  const { users: selectedMembers, roomId } = action.payload;

  if (!roomId || !selectedMembers) {
    return;
  }

  yield put(setIsAddingMembers(true));

  try {
    const userIds = selectedMembers.map((user) => user.value);
    const users = yield select((state) => denormalizeUsers(userIds, state));

    const chatClient: Chat = yield call(chat.get);
    yield call([chatClient, chatClient.addMembersToRoom], roomId, users);

    return yield put(setStage(Stage.None));
  } catch (error: any) {
    yield put(setAddMemberError('Failed to add member, please try again...'));
    return yield put(setStage(Stage.StartAddMemberToRoom));
  } finally {
    yield put(setIsAddingMembers(false));
  }
}

export function* openMemberManagementDialog(action) {
  const { type, userId, roomId } = action.payload;

  yield put(setMemberManagement({ type, userId, roomId, stage: MemberManagementDialogStage.OPEN, error: '' }));
}

export function* cancelMemberManageMent() {
  return yield resetMemberManagement();
}

export function* resetMemberManagement() {
  return yield put(
    setMemberManagement({
      type: MemberManagementAction.None,
      userId: '',
      roomId: '',
      stage: MemberManagementDialogStage.CLOSED,
      error: '',
    })
  );
}

export function* removeMember(action) {
  const { userId, roomId } = action.payload;

  yield put(setMemberManagementStage(MemberManagementDialogStage.IN_PROGRESS));

  try {
    const user = yield select((state) => denormalizeUsers(userId, state));
    if (!user) {
      return;
    }

    const chatClient: Chat = yield call(chat.get);
    yield call([chatClient, chatClient.removeUser], roomId, user);
    yield resetMemberManagement();
  } catch (e) {
    yield put(setMemberManagementError('Failed to remove member, please try again'));
    yield put(setMemberManagementStage(MemberManagementDialogStage.OPEN));
  }
}

export function* setMemberAsModerator(action) {
  const { userId, roomId } = action.payload;

  yield put(setMemberManagementStage(MemberManagementDialogStage.IN_PROGRESS));

  try {
    const user = yield select((state) => denormalizeUsers(userId, state));
    if (!user) {
      return;
    }

    yield call(matrixSetUserAsModerator, roomId, user);
    yield resetMemberManagement();
  } catch (e) {
    yield put(setMemberManagementError('Failed to set member as moderator, please try again'));
    yield put(setMemberManagementStage(MemberManagementDialogStage.OPEN));
  }
}

export function* removeMemberAsModerator(action) {
  const { userId, roomId } = action.payload;

  yield put(setMemberManagementStage(MemberManagementDialogStage.IN_PROGRESS));

  try {
    const user = yield select((state) => denormalizeUsers(userId, state));
    if (!user) {
      return;
    }

    yield call(matrixRemoveUserAsModerator, roomId, user);
    yield resetMemberManagement();
  } catch (e) {
    yield put(setMemberManagementError('Failed to remove member as moderator, please try again'));
    yield put(setMemberManagementStage(MemberManagementDialogStage.OPEN));
  }
}

export function* editConversationNameAndIcon(action) {
  const { roomId, name, image } = action.payload;

  yield put(setEditConversationState(EditConversationState.INPROGRESS));
  try {
    let imageUrl = '';
    if (image) {
      try {
        imageUrl = yield call(uploadFile, image);
      } catch (error) {
        yield put(setEditConversationImageError('Failed to upload image, please try again...'));
        return;
      }
    }

    const chatClient: Chat = yield call(chat.get);
    yield call([chatClient, chatClient.editRoomNameAndIcon], roomId, name, imageUrl);
    yield put(setEditConversationState(EditConversationState.SUCCESS));
    yield put(setEditConversationImageError(''));
    yield put(setEditConversationGeneralError(''));
  } catch (e) {
    yield put(setEditConversationGeneralError('An unknown error has occurred'));
    yield put(setEditConversationState(EditConversationState.LOADED));
  }

  return;
}

export function* openViewGroupInformation() {
  const isSidekickOpen = yield select(isSecondarySidekickOpenSelector);

  if (!isSidekickOpen) {
    yield call(reset);
    yield put(setSecondarySidekickOpen(true));
  }

  yield put(setStage(Stage.ViewGroupInformation));
}

export function* toggleIsSecondarySidekick() {
  const isOpen = yield select(isSecondarySidekickOpenSelector);

  if (!isOpen) {
    yield put(setStage(Stage.None));
  }

  yield put(setSecondarySidekickOpen(!isOpen));
}

export function* openSidekickForSocialChannel(conversationId) {
  const channel = yield select(rawChannelSelector(conversationId));

  if (channel?.isSocialChannel) {
    const isSidekickOpen = yield select(isSecondarySidekickOpenSelector);

    if (!isSidekickOpen) {
      yield put(setSecondarySidekickOpen(true));
    }
  }
}
