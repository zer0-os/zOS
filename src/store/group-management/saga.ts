import { call, fork, put, take, select, takeLatest } from 'redux-saga/effects';
import { Chat, chat } from '../../lib/chat';
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
} from './index';
import { EditConversationState } from './types';
import { uploadImage } from '../registration/api';

export function* reset() {
  yield put(setStage(Stage.None));
  yield put(setIsAddingMembers(false));
  yield put(setAddMemberError(null));
  yield put(setEditConversationState(EditConversationState.NONE));
  yield put(setEditConversationImageError(''));
  yield put(setEditConversationGeneralError(''));
}

export function* saga() {
  yield fork(authWatcher);
  yield takeLatest(SagaActionTypes.LeaveGroup, leaveGroup);

  yield takeLatest(SagaActionTypes.Back, resetConversationManagement);
  yield takeLatest(SagaActionTypes.StartAddMember, startAddGroupMember);
  yield takeLatest(SagaActionTypes.AddSelectedMembers, roomMembersSelected);
  yield takeLatest(SagaActionTypes.EditConversationNameAndIcon, editConversationNameAndIcon);
  yield takeLatest(SagaActionTypes.StartEditConversation, startEditConversation);
  yield takeLatest(SagaActionTypes.RemoveMember, removeMember);
}

export function* resetConversationManagement() {
  // Future: may need to track which stage we were in and move back to a different stage
  // For now, we just reset to the start
  yield call(reset);
}

export function* startAddGroupMember() {
  yield call(reset);
  yield put(setStage(Stage.StartAddMemberToRoom));
}

export function* startEditConversation() {
  yield call(reset);
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

export function* removeMember(action) {
  const { userId, roomId } = action.payload;
  const chatClient: Chat = yield call(chat.get);
  const user = yield select((state) => denormalizeUsers(userId, state));
  if (!user) {
    // Currently no error feedback provided to the user
    return;
  }

  yield call([chatClient, chatClient.removeUser], roomId, user);
}

export function* editConversationNameAndIcon(action) {
  const { roomId, name, image } = action.payload;

  yield put(setEditConversationState(EditConversationState.INPROGRESS));
  try {
    let imageUrl = '';
    if (image) {
      try {
        const uploadResult = yield call(uploadImage, image);
        imageUrl = uploadResult.url;
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
