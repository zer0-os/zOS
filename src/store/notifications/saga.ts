import { takeLatest, put, call } from 'redux-saga/effects';

import { AsyncListStatus } from '../normalized';

import { SagaActionTypes, receive, setStatus } from '.';
import { fetchNotifications } from './api';

export interface Payload {
  userId: string;
}

export function* fetch(action) {
  const { userId } = action.payload;

  yield put(setStatus(AsyncListStatus.Fetching));

  const notifications = yield call(fetchNotifications, userId);

  yield put(receive(notifications));

  yield put(setStatus(AsyncListStatus.Idle));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
