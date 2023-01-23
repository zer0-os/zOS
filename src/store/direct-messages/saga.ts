import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setDirectMessages } from '.';
import { fetchDirectMessages } from './api';

export function* fetch() {
  console.log('khalid hjhjh');
  const directMessages = yield call(fetchDirectMessages);

  yield put(setDirectMessages(directMessages));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
