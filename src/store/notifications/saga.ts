import { takeLatest, put, call, all } from 'redux-saga/effects';

import { AsyncListStatus } from '../normalized';

import { SagaActionTypes, schema, receive, setStatus, relevantNotificationTypes, removeAll } from '.';
import { fetchNotifications } from './api';

export interface Payload {
  userId: string;
}

export function* fetch(action) {
  const { userId } = action.payload;

  yield put(setStatus(AsyncListStatus.Fetching));

  const notifications = yield call(fetchNotifications, userId);

  yield put(receive(notifications.filter((n) => relevantNotificationTypes.includes(n.notificationType))));

  yield put(setStatus(AsyncListStatus.Idle));
}

export function* clearNotifications() {
  yield all([
    put(removeAll({ schema: schema.key })),
    put(receive([])),
  ]);
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
