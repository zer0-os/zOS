import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setActive, setGroupCreating } from '.';
import { createConversation as performCreateConversation } from '../channels-list/saga';

export function* createConversation(action) {
  yield put(setActive(true));
  yield put(setGroupCreating(true));
  yield call(performCreateConversation, { payload: action.payload });
  yield put(setGroupCreating(false));
  yield put(setActive(false));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.CreateConversation, createConversation);
}
