import { all, takeLatest, put, call } from 'redux-saga/effects';
import { AsyncListStatus } from '../normalized';
import { SagaActionTypes, receive, setStatus, removeAll, relevantNotificationTypes, schema } from '.';
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
