import { takeLatest, take, put, call, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

import { AsyncListStatus } from '../normalized';

import { SagaActionTypes, receive, receiveNormalized, setStatus, denormalizeNotifications } from '.';
import { fetchNotifications } from './api';
import PusherClient from '../../lib/pusher';
export interface Payload {
  userId: string;
}

export function* fetch(action) {
  const { userId } = action.payload;

  yield put(setStatus(AsyncListStatus.Fetching));

  const notifications = yield call(fetchNotifications, userId);

  console.log('notifications', notifications);

  yield put(receive(notifications));

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

export function* watchForEvent(userId) {
  const notificationChannel = yield call(createEventChannel, userId);

  while (true) {
    const notification = yield take(notificationChannel);
    console.log('watchOnEvent', notification);

    const existingNotifications = yield select(denormalizeNotifications);
    console.log('existingNotifications', ...existingNotifications);
    console.log('notification', notification);

    yield put(
      receive(
        // ...existingNotifications,
        notification
      )
    );

    // yield put(
    //   receiveNormalized(notification)
    // )
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
