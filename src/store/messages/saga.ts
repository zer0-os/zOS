import { currentUserSelector } from './../authentication/saga';
import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, delay } from 'redux-saga/effects';
import { Message, SagaActionTypes } from '.';
import { receive } from '../channels';
import { channelIdPrefix } from '../channels-list/saga';

import { deleteMessageApi, fetchMessagesByChannelId, sendMessagesByChannelId, editMessageApi } from './api';
import { messageFactory } from './utils';

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
  messageId?: number;
}

export interface EditPayload {
  channelId: string;
  messageId?: number;
  message?: string;
  mentionedUserIds?: string[];
}

export interface SendPayload {
  channelId?: string;
  message?: string;
  mentionedUserIds?: string[];
}

export interface DeleteMessageActionParameter {
  channelId?: string;
  messageId?: number;
}

export interface SendPayload {
  channelId?: string;
  message?: string;
  mentionedUserIds?: string[];
}

const rawMessagesSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].messages`, []);
};

const messageSelector = (messageId) => (state) => {
  return getDeepProperty(state, `normalized.messages[${messageId}]`, []);
};

const rawLastMessageSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].lastMessageCreatedAt`, 0);
};
const getCachedMessageIds = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].messageIdsCache`, []);
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
  const { channelId, message, mentionedUserIds } = action.payload;
  // cloning the array to be able to push new cache id
  const cachedMessageIds = [...(yield select(getCachedMessageIds(channelId)))];

  const existingMessages = yield select(rawMessagesSelector(channelId));
  const currentUser = yield select(currentUserSelector());

  const temporaryMessage = messageFactory(message, currentUser);

  // add cache message id to prevent having double messages when we receive the message from sendbird.
  cachedMessageIds.push(temporaryMessage.id);

  yield put(
    receive({
      id: channelId,
      messages: [
        ...existingMessages,
        temporaryMessage,
      ],
      shouldSyncChannels: true,
      countNewMessages: 0,
      lastMessageCreatedAt: 0,
      messageIdsCache: cachedMessageIds,
    })
  );

  const messagesResponse = yield call(sendMessagesByChannelId, channelId, message, mentionedUserIds);
  const isMessageSent = messagesResponse.status === 200;

  if (!isMessageSent) {
    yield put(
      receive({
        id: channelId,
        messages: [...existingMessages],
        shouldSyncChannels: true,
        countNewMessages: 0,
        lastMessageCreatedAt: messagesResponse.body.createdAt,
        messageIdsCache: cachedMessageIds,
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

  const messagesResponse = yield call(sendMessagesByChannelId, channelId, message, mentionedUserIds);
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

export function* deleteMessage(action) {
  const { channelId, messageId } = action.payload;

  const existingMessages = yield select(rawMessagesSelector(channelId));

  yield put(
    receive({
      id: channelId,
      messages: existingMessages.filter((id) => id !== messageId),
    })
  );

  yield call(deleteMessageApi, channelId, messageId);
}

export function* editMessage(action) {
  const { channelId, messageId, message, mentionedUserIds } = action.payload;
  const selectedMessage = yield select(messageSelector(messageId));
  const existingMessages = yield select(rawMessagesSelector(channelId));

  const messages = existingMessages.map((id) => {
    if (messageId === id) {
      return { ...selectedMessage, updatedAt: Date.now(), message };
    } else {
      return id;
    }
  });

  yield put(
    receive({
      id: channelId,
      messages,
    })
  );

  const messagesResponse = yield call(editMessageApi, channelId, messageId, message, mentionedUserIds);
  const isMessageSent = messagesResponse === 200;

  if (!isMessageSent) {
    yield put(
      receive({
        id: channelId,
        messages: [...existingMessages],
      })
    );
  }
}

export function* receiveDelete(action) {
  const { channelId: channelIdWithPrefix, messageId } = action.payload;
  const channelId = channelIdWithPrefix.replace(channelIdPrefix, '');

  const existingMessages = yield select(rawMessagesSelector(channelId));

  if (existingMessages.length === 0) {
    return;
  }

  yield put(
    receive({
      id: channelId,
      messages: existingMessages.filter((id) => id !== messageId),
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

export function* receiveNewMessage(action) {
  const { channelId: channelIdWithPrefix, message } = action.payload;

  const channelId = channelIdWithPrefix.replace(channelIdPrefix, '');

  const cachedMessageIds = [...(yield select(getCachedMessageIds(channelId)))];
  const currentMessages = yield select(rawMessagesSelector(channelId));

  let messages = [];

  if (cachedMessageIds.length) {
    messages = [
      ...currentMessages,
    ];
    const firstCachedMessageId = cachedMessageIds[0];

    messages = messages.map((messageId) => {
      if (messageId === firstCachedMessageId) {
        cachedMessageIds.shift();
        return message;
      } else {
        return messageId;
      }
    });
  } else {
    messages = [
      ...currentMessages,
      message,
    ];
  }

  yield put(
    receive({
      id: channelId,
      messages,
      messageIdsCache: cachedMessageIds,
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
  yield takeLatest(SagaActionTypes.DeleteMessage, deleteMessage);
  yield takeLatest(SagaActionTypes.EditMessage, editMessage);
  yield takeLatest(SagaActionTypes.startMessageSync, syncChannelsTask);
  yield takeLatest(SagaActionTypes.stopSyncChannels, stopSyncChannels);
  yield takeLatest(SagaActionTypes.receiveNewMessage, receiveNewMessage);
  yield takeLatest(SagaActionTypes.receiveDeleteMessage, receiveDelete);
}
