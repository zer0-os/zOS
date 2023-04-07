import { takeLatest, put, call, select, all } from 'redux-saga/effects';

import { AsyncListStatus, remove } from '../normalized';

import { SagaActionTypes, schema, receive, setStatus, denormalizeNotifications, relevantNotificationTypes } from '.';
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
  const normalized = yield select((state) => {
    return denormalizeNotifications(state);
  });

  yield all([
    ...normalized.map((notification) => {
      return put(remove({ schema: schema.key, id: notification.id }));
    }),
    put(receive([])),
  ]);
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
