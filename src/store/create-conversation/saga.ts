import { put, call, select, race, take, fork, spawn } from 'redux-saga/effects';
import { SagaActionTypes, Stage, setFetchingConversations, setGroupCreating, setGroupUsers, setStage } from '.';
import {
  createConversation as performCreateConversation,
  createUnencryptedConversation as performCreateUnencryptedConversation,
} from '../channels-list/saga';
import { Events, getAuthChannel } from '../authentication/channels';
import { denormalizeConversations } from '../channels-list';
import { openConversation } from '../channels/saga';

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
    return yield call(performGroupMembersSelected, action.payload.users);
  } finally {
    yield put(setFetchingConversations(false));
  }
}

export function* performGroupMembersSelected(userSelections: { value: string; label: string; image?: string }[]) {
  yield put(setGroupUsers(userSelections));
  return Stage.GroupDetails;
}

export function* createConversation(action) {
  const { userIds, name, image } = action.payload;
  try {
    yield put(setGroupCreating(true));
    yield call(performCreateConversation, userIds, name, image);
  } finally {
    yield put(setGroupCreating(false));
  }
}

export function* createUnencryptedConversation(action) {
  const { userIds, name, image, groupType } = action.payload;
  try {
    yield put(setGroupCreating(true));
    yield call(performCreateUnencryptedConversation, userIds, name, image, groupType);
  } finally {
    yield put(setGroupCreating(false));
  }
}

export function* saga() {
  yield fork(authWatcher);

  while (true) {
    const { startEvent, createConversationEvent } = yield race({
      startEvent: take(SagaActionTypes.Start),
      createConversationEvent: take([
        SagaActionTypes.CreateConversation,
        SagaActionTypes.CreateUnencryptedConversation,
      ]),
    });

    if (startEvent) {
      yield call(startConversation);
    } else if (createConversationEvent) {
      if (createConversationEvent.type === SagaActionTypes.CreateConversation) {
        yield call(createConversation, createConversationEvent);
      } else if (createConversationEvent.type === SagaActionTypes.CreateUnencryptedConversation) {
        yield call(createUnencryptedConversation, createConversationEvent);
      }
    }
  }
}

export function* startConversation() {
  try {
    yield call(reset);
    yield put(setStage(Stage.InitiateConversation));

    let currentStage = Stage.InitiateConversation;
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
  [Stage.InitiateConversation]: handleInitiation,
  [Stage.GroupDetails]: handleGroupDetails,
};

const PREVIOUS_STAGES = {
  [Stage.InitiateConversation]: Stage.None,
  [Stage.GroupDetails]: Stage.InitiateConversation,
};

function* handleInitiation() {
  const action = yield take([
    SagaActionTypes.MembersSelected,
    SagaActionTypes.CreateConversation,
    SagaActionTypes.CreateUnencryptedConversation,
  ]);

  if (action.type === SagaActionTypes.MembersSelected) {
    return yield call(groupMembersSelected, action);
  }

  const { userIds } = action.payload;
  const convos = yield select(denormalizeConversations);
  const existingOneOnOne = convos.filter((c) => c.isOneOnOne).find((c) => c.otherMembers[0]?.userId === userIds[0]);

  if (existingOneOnOne) {
    yield call(openConversation, existingOneOnOne.id);
  } else if (action.type === SagaActionTypes.CreateConversation) {
    yield call(createConversation, action);
  } else if (action.type === SagaActionTypes.CreateUnencryptedConversation) {
    yield call(createUnencryptedConversation, action);
  }

  return Stage.None;
}

function* handleGroupDetails() {
  const action = yield take([SagaActionTypes.CreateConversation, SagaActionTypes.CreateUnencryptedConversation]);

  if (action.type === SagaActionTypes.CreateConversation) {
    yield spawn(createConversation, action);
  } else if (action.type === SagaActionTypes.CreateUnencryptedConversation) {
    yield spawn(createUnencryptedConversation, action);
  }

  return Stage.None;
}

function* authWatcher() {
  const channel = yield call(getAuthChannel);
  while (true) {
    yield take(channel, Events.UserLogout);
    yield put({ type: SagaActionTypes.Cancel });
  }
}
