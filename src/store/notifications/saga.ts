import { all, takeLatest, take, put, call, select, fork, spawn, race } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { AsyncListStatus } from '../normalized';
import {
  SagaActionTypes,
  receive,
  setStatus,
  removeAll,
  relevantNotificationTypes,
  schema,
  rawNotificationsList,
  relevantNotificationEvents,
} from '.';
import { fetchNotification, fetchNotifications } from './api';
import PusherClient from '../../lib/pusher';
import { authChannel } from '../authentication/saga';
import { send as sendBrowserMessage } from '../../lib/browser';
import { mapNotification } from '../../components/notification/utils';

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

export function createEventChannel(userId, pusherClient = new PusherClient()) {
  return eventChannel((emit) => {
    const events = relevantNotificationEvents.map((event) => {
      return {
        key: event,
        callback: (notification) => {
          emit({ ...notification, isUnread: true });
        },
      };
    });

    pusherClient.init(userId, events);

    const unsubscribe = () => {
      pusherClient.disconnect();
    };

    return unsubscribe;
  });
}

export function* watchForChannelEvent(userId) {
  const notificationChannel = yield call(createEventChannel, userId);

  while (true) {
    const { abort, notification } = yield race({
      abort: take(SagaActionTypes.CancelEventWatch),
      notification: take(notificationChannel),
    });

    if (abort) {
      notificationChannel.close();
      return false;
    }

    if (relevantNotificationTypes.includes(notification.notificationType)) {
      yield call(processNotification, notification);
    }
  }
}

export function* processNotification(notification) {
  const enhancedNotification = yield call(fetchNotification, notification.id);

  yield all([
    call(addNotification, enhancedNotification),
    call(sendBrowserNotification, enhancedNotification),
  ]);
}

export function* addNotification(notification) {
  const existingNotifications = yield select(rawNotificationsList);

  yield put(
    receive([
      notification,
      ...existingNotifications,
    ])
  );
}

export function* sendBrowserNotification(notification) {
  const { body, id } = mapNotification(notification);

  yield call(sendBrowserMessage, { body, tag: id });
}

export function* clearNotifications() {
  yield all([
    put(removeAll({ schema: schema.key })),
    put(receive([])),
  ]);
}

export function* authWatcher() {
  const channel = yield call(authChannel);

  while (true) {
    const { userId = undefined } = yield take(channel, '*');

    if (userId) {
      yield spawn(watchForChannelEvent, userId);
    } else {
      yield put({ type: SagaActionTypes.CancelEventWatch });
    }
  }
}

export function* saga() {
  yield fork(authWatcher);
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
