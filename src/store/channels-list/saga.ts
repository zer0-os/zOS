import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, receive } from '.';

import { fetchChannels } from './api';
import { AsyncListStatus } from '../normalized';

export const channelIdPrefix = 'sendbird_group_channel_';

export function* fetch(action) {
  yield put(setStatus(AsyncListStatus.Fetching));

  const channels = yield call(fetchChannels, action.payload);
  const channelsList = channels.map((channel) => ({
    id: channel.url.replace(channelIdPrefix, ''),
    name: channel.name,
    icon: channel.icon,
    category: channel.category,
  }));
  yield put(receive(channelsList));

  yield put(setStatus(AsyncListStatus.Idle));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
