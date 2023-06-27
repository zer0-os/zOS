import { ChannelType, DirectMessage } from './types';
import getDeepProperty from 'lodash.get';
import uniqBy from 'lodash.uniqby';
import { takeLatest, put, call, take, race, all, select, spawn } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, receive } from '.';

import {
  fetchChannels as fetchChannelsApi,
  fetchConversations as fetchConversationsMessagesApi,
  createConversation as createConversationMessageApi,
  uploadImage as uploadImageApi,
} from './api';
import { AsyncListStatus } from '../normalized';
import { channelMapper, filterChannelsList } from './utils';
import { setactiveConversationId } from '../chat';
import { clearChannels } from '../channels/saga';
import { conversationsChannel } from './channels';
import { Events, getAuthChannel } from '../authentication/channels';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';

const FETCH_CHAT_CHANNEL_INTERVAL = 60000;

const rawAsyncListStatus = () => (state) => getDeepProperty(state, 'channelsList.status', 'idle');
const rawChannelsList = () => (state) => filterChannelsList(state, ChannelType.Channel);
export const rawConversationsList = () => (state) => filterChannelsList(state, ChannelType.DirectMessage);
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

  // Publish a system message across the channel
  const channel = yield call(conversationsChannel);
  yield put(channel, { loaded: true });
}

export function* createConversation(action) {
  const { name, userIds, image } = action.payload;

  let coverUrl = '';
  if (image) {
    try {
      const uploadResult = yield call(uploadImageApi, image);
      coverUrl = uploadResult.url;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  const response: DirectMessage = yield call(createConversationMessageApi, userIds, name, coverUrl);

  const conversation = channelMapper(response);
  const existingConversationsList = yield select(rawConversationsList());
  const channelsList = yield select(rawChannelsList());

  if (conversation && conversation.id) {
    const hasExistingConversation =
      Array.isArray(existingConversationsList) && existingConversationsList.includes(conversation.id);

    if (!hasExistingConversation) {
      conversation.hasLoadedMessages = true; // Brand new conversation doesn't have messages to load
      // add new chat to the list
      yield put(
        receive([
          ...channelsList,
          ...existingConversationsList,
          conversation,
        ])
      );
    }
    yield put(setactiveConversationId(conversation.id));
  }
}

export function* clearChannelsAndConversations() {
  yield all([
    call(clearChannels),
    put(receive([])),
  ]);
}

export function* fetchChannelsAndConversations() {
  if (String(yield select(rawAsyncListStatus())) !== AsyncListStatus.Stopped) {
    const domainId = yield select((state) => getDeepProperty(state, 'zns.value.rootDomainId'));
    if (domainId) {
      yield call(fetchChannels, { payload: domainId });
    }

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

function* listenForUserLogin() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, Events.UserLogin);
    // Note: not sure why these were tied together. They're separate portions of the application.
    yield startChannelsAndConversationsRefresh();
  }
}

function* listenForUserLogout() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, Events.UserLogout);
    yield put({ type: SagaActionTypes.StopChannelsAndConversationsAutoRefresh });
  }
}

export function* currentUserAddedToChannel(_action) {
  // For now, just force a fetch of conversations to refresh the list.
  yield fetchConversations();
}

export function* saga() {
  yield spawn(listenForUserLogin);
  yield spawn(listenForUserLogout);
  yield takeLatest(SagaActionTypes.FetchChannels, fetchChannels);
  yield takeLatest(SagaActionTypes.StartChannelsAndConversationsAutoRefresh, startChannelsAndConversationsRefresh);
  yield takeLatest(SagaActionTypes.FetchConversations, fetchConversations);
  yield takeLatest(SagaActionTypes.CreateConversation, createConversation);
  yield takeLatest(SagaActionTypes.ChannelsReceived, channelsReceived);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.ChannelInvitationReceived, currentUserAddedToChannel);
}
