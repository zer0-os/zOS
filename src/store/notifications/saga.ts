import { all, takeLatest, take, put, call, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

import { AsyncListStatus } from '../normalized';

import { SagaActionTypes, receive, setStatus, removeAll, relevantNotificationTypes, schema } from '.';
import { fetchNotifications } from './api';
import PusherClient from '../../lib/pusher';
import getDeepProperty from 'lodash.get';

export interface Payload {
  userId: string;
}

export function* fetch(action) {
  const { userId } = action.payload;

  yield put(setStatus(AsyncListStatus.Fetching));

  const notifications = yield call(fetchNotifications, userId);

  console.log('notifications', notifications);

  yield put(receive(notifications.filter((n) => relevantNotificationTypes.includes(n.notificationType))));

  yield put(setStatus(AsyncListStatus.Idle));
}

export function* createEventChannel(userId) {
  const pusherClient = new PusherClient();

  return eventChannel((emit) => {
    const events = {
      'new-notification': (data) => {
        emit({ ...data, isUnread: true });
      },
      'update-notifications': (data) => {
        emit({ ...data, isUnread: true });
      },
    };

    pusherClient.init(userId, events);

    const unsubscribe = () => {
      // socket.off('ping', pingHandler)
    };
    return unsubscribe;
  });
}

export function* watchForEvent(user) {
  const { id: userId } = user;

  const notificationChannel = yield call(createEventChannel, userId);

  while (true) {
    const notification = yield take(notificationChannel);

    const existingNotifications = yield select((state) => getDeepProperty(state, 'notificationsList.value', []));

    yield put(
      receive([
        notification,
        ...existingNotifications,
      ])
    );
  }
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
