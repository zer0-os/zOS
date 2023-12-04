import { SagaActionTypes, Stage, setStage, setIsAddingMembers } from '.';
import { Chat, chat } from '../../lib/chat';
import { call, fork, put, race, take, select } from 'redux-saga/effects';
import { Events, getAuthChannel } from '../authentication/channels';
import { denormalize as denormalizeUsers } from '../users';

export function* reset() {
  yield put(setStage(Stage.None));
  yield put(setIsAddingMembers(false));
}

export function* roomMembersSelected(action) {
  const { users: selectedMembers, roomId } = action.payload;

  try {
    if (!roomId || !selectedMembers) {
      return;
    }

    yield put(setIsAddingMembers(true));

    const userIds = selectedMembers.map((user) => user.value);
    const users = yield select((state) => denormalizeUsers(userIds, state));

    const chatClient: Chat = yield call(chat.get);
    yield call([chatClient, chatClient.addMembersToRoom], roomId, users);

    yield put(setIsAddingMembers(false));
    return Stage.None;
  } catch (error) {
    yield put(setIsAddingMembers(false));
    // TODO: Handle error once we have a UI for it
    console.log('Error in roomMembersSelected:', error);
  }
}

export function* saga() {
  yield fork(authWatcher);

  while (true) {
    const { startEvent } = yield race({
      startEvent: take(SagaActionTypes.StartAddMember),
    });

    if (startEvent) {
      yield call(startAddGroupMember);
    }
  }
}

export function* startAddGroupMember() {
  try {
    yield call(reset);
    yield put(setStage(Stage.StartAddMemberToRoom));

    let currentStage = Stage.StartAddMemberToRoom;
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
  [Stage.StartAddMemberToRoom]: handleStartAddMembersToRoom,
};

const PREVIOUS_STAGES = {
  [Stage.StartAddMemberToRoom]: Stage.None,
};

function* handleStartAddMembersToRoom() {
  const action = yield take(SagaActionTypes.AddSelectedMembers);
  return yield call(roomMembersSelected, action);
}

function* authWatcher() {
  const channel = yield call(getAuthChannel);
  while (true) {
    yield take(channel, Events.UserLogout);
    yield put({ type: SagaActionTypes.Cancel });
  }
}
