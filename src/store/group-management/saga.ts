import { SagaActionTypes, Stage, setStage, LeaveGroupDialogStatus, setLeaveGroupStatus } from './index';
import { call, fork, put, race, take, delay, select, takeLatest } from 'redux-saga/effects';
import { Events, getAuthChannel } from '../authentication/channels';
import { chat } from '../../lib/chat';
import { currentUserSelector } from '../authentication/saga';

export function* reset() {
  yield put(setStage(Stage.None));
}

export function* saga() {
  yield fork(authWatcher);
  yield takeLatest(SagaActionTypes.LeaveGroup, leaveGroup);

  while (true) {
    const { startEvent } = yield race({
      startEvent: take(SagaActionTypes.StartAddMember),
    });

    if (startEvent) {
      console.log('Triggering Start Add Member Stage');
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

      let nextStage = handlerResult || PREVIOUS_STAGES[currentStage];
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
  [Stage.StartAddMemberToRoom]: handleStartAddMember,
};

const PREVIOUS_STAGES = {
  [Stage.StartAddMemberToRoom]: Stage.None,
};

function* handleStartAddMember() {
  console.log('Handle Start Add Member - Implementation Pending');

  // Placeholder action
  try {
    yield delay(1000);
  } catch (error) {
    console.error('Error in handleStartAddMember:', error);
  } finally {
    console.log('Exiting handleStartAddMember - Placeholder action complete');
    yield put(setStage(Stage.None));
  }
}

function* authWatcher() {
  const channel = yield call(getAuthChannel);
  while (true) {
    yield take(channel, Events.UserLogout);
    yield put({ type: SagaActionTypes.Cancel });
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
