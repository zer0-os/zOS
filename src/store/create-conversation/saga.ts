import { takeLatest, put, call, select } from 'redux-saga/effects';
import {
  SagaActionTypes,
  Stage,
  setActive,
  setFetchingConversations,
  setGroupCreating,
  setGroupUsers,
  setStage,
} from '.';
import { channelsReceived, createConversation as performCreateConversation } from '../channels-list/saga';
import { fetchConversationsWithUsers } from '../channels-list/api';
import { setActiveMessengerId } from '../chat';
import { currentUserSelector } from '../authentication/saga';

export function* startConversation(_action) {
  yield put(setActive(false));
  yield put(setGroupCreating(false));
  yield put(setGroupUsers([]));
  yield put(setStage(Stage.CreateOneOnOne));
}

export function* reset(_action) {
  yield put(setActive(false));
  yield put(setGroupUsers([]));
  yield put(setFetchingConversations(false));
  yield put(setGroupCreating(false));
  yield put(setStage(Stage.None));
}

export const getStage = (state) => state.createConversation.stage;

export function* back(_action) {
  const currentStage = yield select(getStage);
  switch (currentStage) {
    case Stage.CreateOneOnOne:
      yield put(setStage(Stage.None));
      break;
    case Stage.StartGroupChat:
      yield put(setStage(Stage.CreateOneOnOne));
      break;
    case Stage.GroupDetails:
      yield put(setStage(Stage.StartGroupChat));
      break;
  }
}

export function* forward(_action) {
  const currentStage = yield select(getStage);
  switch (currentStage) {
    case Stage.CreateOneOnOne:
      yield put(setStage(Stage.StartGroupChat));
      break;
    case Stage.StartGroupChat:
      yield put(setStage(Stage.GroupDetails));
      break;
  }
}

export function* groupMembersSelected(action) {
  yield put(setFetchingConversations(true));
  yield call(performGroupMembersSelected, action);
  yield put(setFetchingConversations(false));
}

export function* performGroupMembersSelected(action) {
  const { users } = action.payload;

  const currentUser = yield select(currentUserSelector);
  const userIds = [
    currentUser.id,
    ...users.map((o) => o.value),
  ];
  const existingConversations = yield call(fetchConversationsWithUsers, userIds);

  if (existingConversations.length === 0) {
    yield put(setGroupUsers(users));
    yield put(setStage(Stage.GroupDetails));
  } else {
    const selectedConversation = existingConversations[0];
    yield call(channelsReceived, { payload: { channels: [selectedConversation] } });
    yield put(setActiveMessengerId(selectedConversation.id));
    yield call(reset, {});
  }
}

export function* createConversation(action) {
  yield put(setActive(true));
  yield put(setGroupCreating(true));
  yield call(performCreateConversation, { payload: action.payload });
  yield put(setGroupCreating(false));
  yield put(setActive(false));
  yield call(reset, {});
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Start, startConversation);
  yield takeLatest(SagaActionTypes.Back, back);
  yield takeLatest(SagaActionTypes.Forward, forward);
  yield takeLatest(SagaActionTypes.Reset, reset);
  yield takeLatest(SagaActionTypes.MembersSelected, groupMembersSelected);
  yield takeLatest(SagaActionTypes.CreateConversation, createConversation);
}
