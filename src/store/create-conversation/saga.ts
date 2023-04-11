import { put, call, select, race, take } from 'redux-saga/effects';
import { SagaActionTypes, Stage, setFetchingConversations, setGroupCreating, setGroupUsers, setStage } from '.';
import { channelsReceived, createConversation as performCreateConversation } from '../channels-list/saga';
import { fetchConversationsWithUsers } from '../channels-list/api';
import { setActiveMessengerId } from '../chat';
import { currentUserSelector } from '../authentication/saga';

export function* reset(_action) {
  yield put(setGroupUsers([]));
  yield put(setFetchingConversations(false));
  yield put(setGroupCreating(false));
  yield put(setStage(Stage.None));
}

export const getStage = (state) => state.createConversation.stage;

export function previousStage(currentStage: Stage) {
  switch (currentStage) {
    case Stage.CreateOneOnOne:
      return Stage.None;
    case Stage.StartGroupChat:
      return Stage.CreateOneOnOne;
    case Stage.GroupDetails:
      return Stage.StartGroupChat;
  }
  return Stage.None;
}

export function* groupMembersSelected(action) {
  try {
    yield put(setFetchingConversations(true));
    return yield call(performGroupMembersSelected, action);
  } finally {
    yield put(setFetchingConversations(false));
  }
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
    return Stage.GroupDetails;
  } else {
    const selectedConversation = existingConversations[0];
    yield call(channelsReceived, { payload: { channels: [selectedConversation] } });
    yield put(setActiveMessengerId(selectedConversation.id));
    return Stage.None;
  }
}

export function* createConversation(action) {
  try {
    yield put(setGroupCreating(true));
    yield call(performCreateConversation, { payload: action.payload });
  } finally {
    yield put(setGroupCreating(false));
  }
}

export function* saga() {
  yield take(SagaActionTypes.Start);
  yield startConversation();
}

// XXX: handle cancellations for slow things... like...pressing back while a request is running?..
// XXX: Also handle logout / full cancellations...any others besides logout?
export function* startConversation() {
  try {
    yield call(reset, {});
    yield put(setStage(Stage.CreateOneOnOne));

    let currentStage = Stage.CreateOneOnOne;
    while (currentStage !== Stage.None) {
      const { back, handlerResult } = yield race({
        back: take(SagaActionTypes.Back),
        handlerResult: call(STAGE_HANDLERS[currentStage]),
      });

      let nextStage = handlerResult;
      if (back) {
        nextStage = previousStage(currentStage);
      }

      yield put(setStage(nextStage));
      currentStage = nextStage;
    }
  } finally {
    yield call(reset, {});
  }
}

const STAGE_HANDLERS = {
  [Stage.CreateOneOnOne]: handleOneOnOne,
  [Stage.StartGroupChat]: handleStartGroup,
  [Stage.GroupDetails]: handleGroupDetails,
};

function* handleOneOnOne() {
  const action = yield take([
    SagaActionTypes.Forward,
    SagaActionTypes.CreateConversation,
  ]);
  if (action.type === SagaActionTypes.Forward) {
    return Stage.StartGroupChat;
  }
  yield call(createConversation, action);
  return Stage.None;
}

function* handleStartGroup() {
  const action = yield take(SagaActionTypes.MembersSelected);
  return yield call(groupMembersSelected, action);
}

function* handleGroupDetails() {
  const action = yield take(SagaActionTypes.CreateConversation);
  yield call(createConversation, action);
  return Stage.None;
}
