import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, delay } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, receive } from '.';

import { fetchChannels } from './api';
import { AsyncListStatus } from '../normalized';
import { select } from 'redux-saga-test-plan/matchers';

export interface Payload {
  channelId: string;
}

export const channelIdPrefix = 'sendbird_group_channel_';

const FETCH_CHAT_CHANNEL_INTERVAL = 60000;

const rawAsyncListStatus = () => (state) => getDeepProperty(state, 'channelsList.status', 'idle');

export function* fetch(action) {
  yield put(setStatus(AsyncListStatus.Fetching));

  const channels = yield call(fetchChannels, action.payload);
  const channelsList = channels.map((channel) => ({
    id: channel.url.replace(channelIdPrefix, ''),
    name: channel.name,
    icon: channel.icon,
    category: channel.category,
    unreadCount: channel.unreadCount,
  }));
  yield put(receive(channelsList));

  yield put(setStatus(AsyncListStatus.Idle));
}

export function* unreadCountUpdated(action) {
  const channels = yield call(fetchChannels, action.payload);
  const channelsList = yield channels.map((channel) => {
    return {
      id: channel.url.replace(channelIdPrefix, ''),
      name: channel.name,
      icon: channel.icon,
      category: channel.category,
      unreadCount: channel.unreadCount ? channel.unreadCount : 0,
    };
  });

  yield put(receive(channelsList));
}

export function* stopSyncChannels() {
  yield put(setStatus(AsyncListStatus.Stopped));
}

function* syncUnreadCount(action) {
  while (String(yield select(rawAsyncListStatus())) !== AsyncListStatus.Stopped) {
    yield call(unreadCountUpdated, action);
    yield delay(FETCH_CHAT_CHANNEL_INTERVAL);
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
  yield takeLatest(SagaActionTypes.ReceiveUnreadCount, syncUnreadCount);
  yield takeLatest(SagaActionTypes.StopSyncChannels, stopSyncChannels);
}
