import { ChannelType, DirectMessage } from './types';
import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, delay, take, race } from 'redux-saga/effects';
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
  const channelsList = channels.map((currentChannel) => channelMapper(currentChannel));

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

  const directMessagesList = directMessages.map((currentChannel) => channelMapper(currentChannel));

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

  const directMessage = channelMapper(response);
  const existingDirectMessages = yield select(rawDirectMessages());
  const channelsList = yield select(rawChannelsList());

  if (directMessage && directMessage.id) {
    const hasExistingChat = Array.isArray(existingDirectMessages) && existingDirectMessages.includes(directMessage.id);

    if (!hasExistingChat) {
      // add new chat to the list
      yield put(
        receive([
          ...channelsList,
          ...existingDirectMessages,
          directMessage,
        ])
      );
    }
    yield put(setActiveMessengerId(directMessage.id));
  }
}

function* fetchChannelsAndConversations() {
  const domainId = yield select((state) => getDeepProperty(state, 'zns.value.rootDomainId'));

  if (String(yield select(rawAsyncListStatus())) !== AsyncListStatus.Stopped) {
    yield call(fetch, { payload: domainId });
    yield call(fetchDirectMessages);

    yield delay(FETCH_CHAT_CHANNEL_INTERVAL);
  }
}

function* startChannelsAndConversationsRefresh() {
  while (true) {
    const { terminate, _result } = yield race({
      terminate: take(SagaActionTypes.StopChannelsAndConversationsAutoRefresh),
      result: call(fetchChannelsAndConversations),
    });

    if (terminate) break;
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
  yield takeLatest(SagaActionTypes.StartChannelsAndConversationsAutoRefresh, startChannelsAndConversationsRefresh);
  yield takeLatest(SagaActionTypes.FetchDirectMessages, fetchDirectMessages);
  yield takeLatest(SagaActionTypes.CreateDirectMessage, createDirectMessage);
}
