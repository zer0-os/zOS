import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, receive } from '.';

import { api } from './api';
import { AsyncListStatus } from '../normalized';

export function* fetch(action) {
  yield put(setStatus(AsyncListStatus.Fetching));

  const channels = yield call(api.fetch, action.payload);

  yield put(receive(channels));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
