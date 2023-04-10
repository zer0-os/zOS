import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaActionTypes, Stage, setActive, setGroupCreating, setStage } from '.';
import { createConversation as performCreateConversation } from '../channels-list/saga';

export function* startConversation(_action) {
  yield put(setActive(false));
  yield put(setGroupCreating(false));
  yield put(setStage(Stage.CreateOneOnOne));
}

export function* reset(_action) {
  yield put(setActive(false));
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

export function* createConversation(action) {
  yield put(setActive(true));
  yield put(setGroupCreating(true));
  yield call(performCreateConversation, { payload: action.payload });
  yield put(setGroupCreating(false));
  yield put(setActive(false));
  yield call(reset, {});
}

export function* saga() {
  // XXX: Tweak these. We don't need to listen here and should
  // listen at the correct moments in the user saga
  yield takeLatest(SagaActionTypes.Start, startConversation);
  yield takeLatest(SagaActionTypes.Back, back);
  yield takeLatest(SagaActionTypes.Forward, forward);
  yield takeLatest(SagaActionTypes.Reset, reset);
  yield takeLatest(SagaActionTypes.CreateConversation, createConversation);
}
