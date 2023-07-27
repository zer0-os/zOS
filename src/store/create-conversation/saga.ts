import { put, call, select, race, take, fork } from 'redux-saga/effects';
import { SagaActionTypes, Stage, setFetchingConversations, setGroupCreating, setGroupUsers, setStage } from '.';
import { channelsReceived, createConversation as performCreateConversation } from '../channels-list/saga';
import { fetchConversationsWithUsers } from '../channels-list/api';
import { setactiveConversationId } from '../chat';
import { currentUserSelector } from '../authentication/saga';
import { Events, getAuthChannel } from '../authentication/channels';

export function* reset() {
  yield put(setGroupUsers([]));
  yield put(setFetchingConversations(false));
  yield put(setGroupCreating(false));
  yield put(setStage(Stage.None));
}

export const getStage = (state) => state.createConversation.stage;

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
    yield put(setactiveConversationId(selectedConversation.id));
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
  yield fork(authWatcher);

  while (true) {
    const { startEvent, createConversationEvent } = yield race({
      startEvent: take(SagaActionTypes.Start),
      createConversationEvent: take(SagaActionTypes.CreateConversation),
    });

    if (startEvent) {
      yield call(startConversation);
    } else if (createConversationEvent) {
      yield call(createConversation, createConversationEvent);
    }
  }
}

export function* startConversation() {
  try {
    yield call(reset);
    yield put(setStage(Stage.CreateOneOnOne));

    let currentStage = Stage.CreateOneOnOne;
    while (currentStage !== Stage.None) {
      const { back, cancel, handlerResult } = yield race({
        back: take(SagaActionTypes.Back),
        cancel: take(SagaActionTypes.Cancel),
        handlerResult: call(STAGE_HANDLERS[currentStage]),
      });

      let nextStage = handlerResult;
      if (cancel) {
        nextStage = Stage.None;
      } else if (back) {
        nextStage = PREVIOUS_STAGES[currentStage];
      }

      yield put(setStage(nextStage));
      currentStage = nextStage;
    }
  } finally {
    yield call(reset);
  }
}

const STAGE_HANDLERS = {
  [Stage.CreateOneOnOne]: handleOneOnOne,
  [Stage.StartGroupChat]: handleStartGroup,
  [Stage.GroupDetails]: handleGroupDetails,
};

const PREVIOUS_STAGES = {
  [Stage.CreateOneOnOne]: Stage.None,
  [Stage.StartGroupChat]: Stage.CreateOneOnOne,
  [Stage.GroupDetails]: Stage.StartGroupChat,
};

function* handleOneOnOne() {
  const action = yield take([
    SagaActionTypes.StartGroup,
    SagaActionTypes.CreateConversation,
  ]);
  if (action.type === SagaActionTypes.StartGroup) {
    yield put(setGroupUsers([]));
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

function* authWatcher() {
  const channel = yield call(getAuthChannel);
  while (true) {
    yield take(channel, Events.UserLogout);
    yield put({ type: SagaActionTypes.Cancel });
  }
}
