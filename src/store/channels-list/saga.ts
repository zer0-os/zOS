import { ChannelType, DirectMessage } from './types';
import getDeepProperty from 'lodash.get';
import uniqBy from 'lodash.uniqby';
import { takeLatest, put, call, take, race } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, receive } from '.';

import {
  fetchChannels as fetchChannelsApi,
  fetchConversations as fetchConversationsMessagesApi,
  createConversation as createConversationMessageApi,
} from './api';
import { AsyncListStatus } from '../normalized';
import { select } from 'redux-saga-test-plan/matchers';
import { channelMapper, filterChannelsList } from './utils';
import { setActiveMessengerId } from '../chat';

const FETCH_CHAT_CHANNEL_INTERVAL = 60000;

const rawAsyncListStatus = () => (state) => getDeepProperty(state, 'channelsList.status', 'idle');
const rawChannelsList = () => (state) => filterChannelsList(state, ChannelType.Channel);
const rawConversationsList = () => (state) => filterChannelsList(state, ChannelType.DirectMessage);
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export function* fetchChannels(action) {
  yield put(setStatus(AsyncListStatus.Fetching));

  const channels = yield call(fetchChannelsApi, action.payload);
  const channelsList = channels.map((currentChannel) => channelMapper(currentChannel));

  const conversationsList = yield select(rawConversationsList());

  yield put(
    receive([
      ...channelsList,
      ...conversationsList,
    ])
  );

  yield put(setStatus(AsyncListStatus.Idle));
}

export function* fetchConversations() {
  const conversations = yield call(fetchConversationsMessagesApi);
  const channelsList = yield select(rawChannelsList());

  const conversationsList = conversations.map((currentChannel) => channelMapper(currentChannel));

  yield put(
    receive([
      ...channelsList,
      ...conversationsList,
    ])
  );
}

export function* createConversation(action) {
  const { userIds } = action.payload;
  const response: DirectMessage = yield call(createConversationMessageApi, userIds);

  const conversation = channelMapper(response);
  const existingConversationsList = yield select(rawConversationsList());
  const channelsList = yield select(rawChannelsList());

  if (conversation && conversation.id) {
    const hasExistingConversation =
      Array.isArray(existingConversationsList) && existingConversationsList.includes(conversation.id);

    if (!hasExistingConversation) {
      // add new chat to the list
      yield put(
        receive([
          ...channelsList,
          ...existingConversationsList,
          conversation,
        ])
      );
    }
    yield put(setActiveMessengerId(conversation.id));
  }
}

export function* fetchChannelsAndConversations() {
  if (String(yield select(rawAsyncListStatus())) !== AsyncListStatus.Stopped) {
    const domainId = yield select((state) => getDeepProperty(state, 'zns.value.rootDomainId'));
    yield call(fetchChannels, { payload: domainId });

    yield call(fetchConversations);

    yield call(delay, FETCH_CHAT_CHANNEL_INTERVAL);
  }
}

export function* startChannelsAndConversationsRefresh() {
  while (true) {
    const { abort, _success } = yield race({
      abort: take(SagaActionTypes.StopChannelsAndConversationsAutoRefresh),
      success: call(fetchChannelsAndConversations),
    });

    if (abort) return false;
  }
}

export function* channelsReceived(action) {
  const { channels } = action.payload;

  const newChannels = channels.map(channelMapper);

  // Silly to get them separately but we'll be splitting these anyway
  const existingDirectMessages = yield select(rawConversationsList());
  const existingChannels = yield select(rawChannelsList());

  const newChannelList = uniqBy(
    [
      ...existingChannels,
      ...existingDirectMessages,
      ...newChannels,
    ],
    (c) => c.id ?? c
  );

  yield put(receive(newChannelList));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.FetchChannels, fetchChannels);
  yield takeLatest(SagaActionTypes.StartChannelsAndConversationsAutoRefresh, startChannelsAndConversationsRefresh);
  yield takeLatest(SagaActionTypes.FetchConversations, fetchConversations);
  yield takeLatest(SagaActionTypes.CreateConversation, createConversation);
  yield takeLatest(SagaActionTypes.ChannelsReceived, channelsReceived);
}
