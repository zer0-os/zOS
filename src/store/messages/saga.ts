import { currentUserSelector } from './../authentication/saga';
import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, delay } from 'redux-saga/effects';
import { Message, SagaActionTypes } from '.';
import { receive } from '../channels';
import { channelIdPrefix } from '../channels-list/saga';

import { fetchMessagesByChannelId, sendMessagesByChannelId } from './api';
import { messageFactory } from './utils';

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
}

export interface SendPayload {
  channelId?: string;
  message?: string;
}

const rawMessagesSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].messages`, []);
};

const rawLastMessageSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].lastMessageCreatedAt`, 0);
};

const rawShouldSyncChannels = (channelId) => (state) =>
  getDeepProperty(state, `normalized.channels[${channelId}].shouldSyncChannels`, false);

const FETCH_CHAT_CHANNEL_INTERVAL = 60000;

export function* fetch(action) {
  const { channelId, referenceTimestamp } = action.payload;

  let messagesResponse: any;
  let messages: any[];
  const channelPrefix: string = channelIdPrefix + channelId;

  if (referenceTimestamp) {
    const existingMessages = yield select(rawMessagesSelector(channelId));
    messagesResponse = yield call(fetchMessagesByChannelId, channelPrefix, referenceTimestamp);
    messages = [
      ...existingMessages,
      ...messagesResponse.messages,
    ];
  } else {
    messagesResponse = yield call(fetchMessagesByChannelId, channelPrefix);
    messages = messagesResponse.messages;
  }

  yield put(
    receive({
      id: channelId,
      messages,
      hasMore: messagesResponse.hasMore,
      shouldSyncChannels: true,
      unreadCount: 0,
    })
  );
}

export function* send(action) {
  const { channelId, message } = action.payload;

  const existingMessages = yield select(rawMessagesSelector(channelId));
  const currentUser = yield select(currentUserSelector());

  yield put(
    receive({
      id: channelId,
      messages: [
        ...existingMessages,
        messageFactory(message, currentUser),
      ],
      shouldSyncChannels: true,
      countNewMessages: 0,
      lastMessageCreatedAt: 0,
    })
  );

  const messagesResponse = yield call(sendMessagesByChannelId, channelId, message);
  const isMessageSent = messagesResponse.status === 200;

  if (!isMessageSent) {
    yield put(
      receive({
        id: channelId,
        messages: [...existingMessages],
        shouldSyncChannels: true,
        countNewMessages: 0,
        lastMessageCreatedAt: messagesResponse.body.createdAt,
      })
    );
  } else {
    const messages = [
      ...existingMessages,
      messagesResponse.body,
    ];

    yield put(
      receive({
        id: channelId,
        messages,
        shouldSyncChannels: true,
        countNewMessages: 0,
        lastMessageCreatedAt: messagesResponse.body.createdAt,
      })
    );
  }
}

export function* fetchNewMessages(action) {
  const { channelId } = action.payload;
  const channelPrefix: string = channelIdPrefix + channelId;
  let countNewMessages: number = 0;

  const messagesResponse = yield call(fetchMessagesByChannelId, channelPrefix);
  const lastMessageCreatedAt = yield select(rawLastMessageSelector(channelId));
  if (lastMessageCreatedAt > 0) {
    countNewMessages = getCountNewMessages(messagesResponse.messages, lastMessageCreatedAt);
  }

  const lastMessage = filtredLastMessage(messagesResponse.messages);

  yield put(
    receive({
      id: channelId,
      messages: messagesResponse.messages,
      hasMore: messagesResponse.hasMore,
      countNewMessages,
      lastMessageCreatedAt: lastMessage.createdAt > lastMessageCreatedAt ? lastMessage.createdAt : lastMessageCreatedAt,
    })
  );
}

export function* stopSyncChannels(action) {
  const { channelId } = action.payload;

  yield put(
    receive({
      id: channelId,
      shouldSyncChannels: false,
    })
  );
}

function getCountNewMessages(messages: Message[] = [], lastMessageCreatedAt: number): number {
  return messages.filter((x) => x.createdAt > lastMessageCreatedAt).length;
}

function filtredLastMessage(messages: Message[]): Message {
  return messages[Object.keys(messages).pop()];
}

function* syncChannelsTask(action) {
  while (yield select(rawShouldSyncChannels(action.payload.channelId))) {
    yield call(fetchNewMessages, action);
    yield delay(FETCH_CHAT_CHANNEL_INTERVAL);
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
  yield takeLatest(SagaActionTypes.Send, send);
  yield takeLatest(SagaActionTypes.startMessageSync, syncChannelsTask);
  yield takeLatest(SagaActionTypes.stopSyncChannels, stopSyncChannels);
}
