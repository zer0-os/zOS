import { ChannelType, DirectMessage } from './types';
import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, delay } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, receive } from '.';

import {
  fetchChannels,
  fetchDirectMessages as fetchDirectMessagesApi,
  createDirectMessage as createDirectMessageApi,
} from './api';
import { AsyncListStatus } from '../normalized';
import { select } from 'redux-saga-test-plan/matchers';
import { channelMapper, filterChannelsList } from './utils';
import { setActiveMessengerId } from '../chat';

const FETCH_CHAT_CHANNEL_INTERVAL = 60000;

const rawAsyncListStatus = () => (state) => getDeepProperty(state, 'channelsList.status', 'idle');
const rawChannelsList = () => (state) => filterChannelsList(state, ChannelType.Channel);
const rawDirectMessages = () => (state) => filterChannelsList(state, ChannelType.DirectMessage);

export function* fetch(action) {
  yield put(setStatus(AsyncListStatus.Fetching));

  const channels = yield call(fetchChannels, action.payload);
  const channelsList = channels.map((currentChannel) => channelMapper(currentChannel, ChannelType.Channel));

  const directMessages = yield select(rawDirectMessages());

  yield put(
    receive([
      ...channelsList,
      ...directMessages,
    ])
  );

  yield put(setStatus(AsyncListStatus.Idle));
}

export function* fetchDirectMessages() {
  const directMessages = yield call(fetchDirectMessagesApi);
  const channelsList = yield select(rawChannelsList());

  const directMessagesList = directMessages.map((currentChannel) =>
    channelMapper(currentChannel, ChannelType.DirectMessage)
  );

  yield put(
    receive([
      ...channelsList,
      ...directMessagesList,
    ])
  );
}

export function* createDirectMessage(action) {
  const { userIds } = action.payload;
  const response: DirectMessage = yield call(createDirectMessageApi, userIds);

  const directMessage = channelMapper(response, ChannelType.DirectMessage);
  const existingDirectMessages = yield select(rawDirectMessages());
  const channelsList = yield select(rawChannelsList());

  if (directMessage && directMessage.id) {
    yield put(
      receive([
        ...channelsList,
        ...existingDirectMessages,
        directMessage,
      ])
    );
    yield put(setActiveMessengerId(directMessage.id));
  }
}

export function* unreadCountUpdated(action) {
  const channels = yield call(fetchChannels, action.payload);
  const directMessages = yield call(fetchDirectMessagesApi);

  const channelsList = channels.map((channel) => channelMapper(channel, ChannelType.Channel));

  const directMessagesList = directMessages.map((channel) => channelMapper(channel, ChannelType.DirectMessage));

  yield put(
    receive([
      ...channelsList,
      ...directMessagesList,
    ])
  );
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
  yield takeLatest(SagaActionTypes.FetchDirectMessages, fetchDirectMessages);
  yield takeLatest(SagaActionTypes.CreateDirectMessage, createDirectMessage);
}
