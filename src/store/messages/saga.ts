import { currentUserSelector } from './../authentication/saga';
import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, delay, spawn } from 'redux-saga/effects';
import { EditMessageOptions, Message, SagaActionTypes, schema, removeAll, denormalize, MediaType } from '.';
import { receive as receiveMessage } from './';
import { Channel, receive } from '../channels';
import { markChannelAsReadIfActive, markConversationAsReadIfActive, rawChannelSelector } from '../channels/saga';

import {
  deleteMessageApi,
  fetchMessagesByChannelId,
  sendMessagesByChannelId,
  editMessageApi,
  getLinkPreviews,
} from './api';
import { extractLink, linkifyType, createOptimisticMessageObject } from './utils';
import { ParentMessage } from '../../lib/chat/types';
import { send as sendBrowserMessage, mapMessage } from '../../lib/browser';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { ChannelEvents, conversationsChannel } from '../channels-list/channels';
import { Uploadable, createUploadableFile } from './uploadable';

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
  messageId?: number;
}
export interface QueryUploadPayload {
  api_key: string;
  signature: string;
  timestamp: number;
}
export interface FileUploadResult {
  name: string;
  url: string;
  width?: number;
  height?: number;
  type: 'image' | 'video' | 'file' | 'audio';
  meta?: any;
}

export interface EditPayload {
  channelId: string;
  messageId?: number;
  message?: string;
  mentionedUserIds?: string[];
  data?: Partial<EditMessageOptions>;
}

export interface SendPayload {
  channelId?: string;
  message?: string;
  mentionedUserIds?: string[];
  parentMessage?: ParentMessage;
  parentMessageId?: number;
  parentMessageUserId?: string;
  file?: FileUploadResult;
  optimisticId?: string;
  files?: MediaInfo[];
}

interface MediaInfo {
  nativeFile?: File;
  giphy?: any;
  name: string;
  url: string;
  mediaType: MediaType;
}

const rawMessagesSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].messages`, []);
};

const messageSelector = (messageId) => (state) => {
  return getDeepProperty(state, `normalized.messages[${messageId}]`, null);
};

const rawLastMessageSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}].lastMessageCreatedAt`, 0);
};
const rawShouldSyncChannels = (channelId) => (state) =>
  getDeepProperty(state, `normalized.channels[${channelId}].shouldSyncChannels`, false);

export const _isChannel = (channelId) => (state) =>
  getDeepProperty(state, `normalized.channels[${channelId}].isChannel`, null);

const FETCH_CHAT_CHANNEL_INTERVAL = 60000;

export function* fetch(action) {
  const { channelId, referenceTimestamp } = action.payload;

  let messagesResponse: any;
  let messages: any[];

  if (referenceTimestamp) {
    const existingMessages = yield select(rawMessagesSelector(channelId));
    messagesResponse = yield call(fetchMessagesByChannelId, channelId, referenceTimestamp);
    messages = [
      ...messagesResponse.messages,
      ...existingMessages,
    ];
  } else {
    messagesResponse = yield call(fetchMessagesByChannelId, channelId);
    messages = messagesResponse.messages;
  }

  yield put(
    receive({
      id: channelId,
      messages,
      hasMore: messagesResponse.hasMore,
      shouldSyncChannels: true,
      hasLoadedMessages: true,
    })
  );

  // Publish a system message across the channel
  const channel = yield call(conversationsChannel);
  const isChannel = yield select(_isChannel(channelId));
  yield put(channel, {
    type: isChannel ? ChannelEvents.MessagesLoadedForChannel : ChannelEvents.MessagesLoadedForConversation,
    channelId,
  });
}

export function* send(action) {
  const { channelId, message, mentionedUserIds, parentMessage, files } = action.payload;

  let rootMessageId = '';
  if (message?.trim()) {
    const { optimisticMessage } = yield call(createOptimisticMessage, channelId, message, parentMessage);

    yield spawn(createOptimisticPreview, channelId, optimisticMessage);
    const textMessage = yield call(
      performSend,
      channelId,
      message,
      mentionedUserIds,
      parentMessage,
      optimisticMessage.id
    );
    rootMessageId = textMessage.id;
  }

  const uploadableFiles: Uploadable[] = [];
  if (files?.length) {
    files.forEach((f) => uploadableFiles.push(createUploadableFile(f)));
    let rootId = rootMessageId;
    for (const index in uploadableFiles) {
      const file = uploadableFiles[index].file;
      const { optimisticMessage } = yield call(createOptimisticMessage, channelId, '', null, file, rootId);
      uploadableFiles[index].optimisticMessage = optimisticMessage;
      rootId = ''; // only the first file should connect to the root message for now.
    }
  }

  if (uploadableFiles?.length) {
    yield call(uploadFileMessages, channelId, rootMessageId, uploadableFiles);
  }
}

export function* createOptimisticMessage(channelId, message, parentMessage, file?, rootMessageId?) {
  const existingMessages = yield select(rawMessagesSelector(channelId));
  const currentUser = yield select(currentUserSelector());

  const temporaryMessage = createOptimisticMessageObject(message, currentUser, parentMessage, file, rootMessageId);

  yield put(
    receive({
      id: channelId,
      messages: [
        ...existingMessages,
        temporaryMessage,
      ],
      lastMessage: temporaryMessage,
      lastMessageCreatedAt: temporaryMessage.createdAt,
    })
  );

  return { optimisticMessage: temporaryMessage };
}

export function* createOptimisticPreview(channelId: string, optimisticMessage) {
  const preview = yield getPreview(optimisticMessage.message);

  if (preview) {
    yield put(receiveMessage({ id: optimisticMessage.id, preview }));
  }
}

export function* performSend(channelId, message, mentionedUserIds, parentMessage, optimisticId) {
  const messageCall = call(
    sendMessagesByChannelId,
    channelId,
    message,
    mentionedUserIds,
    parentMessage,
    null,
    optimisticId
  );
  return yield sendMessage(messageCall, channelId, optimisticId);
}

export function* sendMessage(apiCall, channelId, optimisticId) {
  try {
    const createdMessage = yield apiCall;
    const existingMessageIds = yield select(rawMessagesSelector(channelId));
    const messages = yield call(replaceOptimisticMessage, existingMessageIds, createdMessage);
    if (messages) {
      yield put(receive({ id: channelId, messages: messages }));
    }
    return createdMessage;
  } catch (e) {
    yield call(messageSendFailed, channelId, optimisticId);
  }
}

export function* messageSendFailed(channelId, optimisticId) {
  const existingMessageIds = yield select(rawMessagesSelector(channelId));
  const messagesWithoutFailed = existingMessageIds.filter((id) => id !== optimisticId);
  const lastMessage = yield select((state) =>
    denormalize(messagesWithoutFailed[messagesWithoutFailed.length - 1], state)
  );

  yield put(
    receive({
      id: channelId,
      messages: messagesWithoutFailed,
      lastMessage: lastMessage,
      lastMessageCreatedAt: lastMessage.createdAt,
    })
  );
}

export function* fetchNewMessages(action) {
  const { channelId } = action.payload;
  let countNewMessages: number = 0;

  const messagesResponse = yield call(fetchMessagesByChannelId, channelId);
  const lastMessageCreatedAt = yield select(rawLastMessageSelector(channelId));
  if (lastMessageCreatedAt > 0) {
    countNewMessages = getCountNewMessages(messagesResponse.messages, lastMessageCreatedAt);
  }

  const lastMessage = filteredLastMessage(messagesResponse.messages);

  yield put(
    receive({
      id: channelId,
      messages: messagesResponse.messages,
      hasMore: messagesResponse.hasMore,
      countNewMessages,
      lastMessageCreatedAt:
        lastMessage && lastMessage.createdAt > lastMessageCreatedAt ? lastMessage.createdAt : lastMessageCreatedAt,
    })
  );
}

export function* deleteMessage(action) {
  const { channelId, messageId } = action.payload;

  const existingMessageIds = yield select(rawMessagesSelector(channelId));
  const fullMessages = yield select((state) => denormalize(existingMessageIds, state));

  const messageIdsToDelete = fullMessages
    .filter((m) => m.rootMessageId === messageId.toString()) // toString() because message ids are currently a number
    .map((m) => m.id);
  messageIdsToDelete.unshift(messageId);

  yield put(
    receive({
      id: channelId,
      messages: existingMessageIds.filter((id) => !messageIdsToDelete.includes(id)),
    })
  );

  // In the future we'd prefer that the api did this so that the front-ends
  // could treat these as independent messages. However, given that we have
  // multiple front ends and they don't all support treating these messages
  // as a single entity yet, this is how we'll do it for now.
  for (let id of messageIdsToDelete) {
    yield call(deleteMessageApi, channelId, id);
  }
}

export function* editMessage(action) {
  const { channelId, messageId, message, mentionedUserIds, data } = action.payload;

  const selectedMessage = yield select(messageSelector(messageId));
  const existingMessages = yield select(rawMessagesSelector(channelId));

  const messages = existingMessages.map((id) => {
    if (messageId === id) {
      return { ...selectedMessage, updatedAt: Date.now(), message, hidePreview: Boolean(data?.hidePreview) };
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

  const messagesResponse = yield call(editMessageApi, channelId, messageId, message, mentionedUserIds, data);
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

export function* uploadFileMessages(channelId = null, rootMessageId = '', uploadableFiles: Uploadable[]) {
  // Opportunities for parallelization here.
  for (const uploadableFile of uploadableFiles) {
    const upload = call(
      [
        uploadableFile,
        'upload',
      ],
      channelId,
      rootMessageId
    );
    yield sendMessage(upload, channelId, uploadableFile.optimisticMessage.id);
    rootMessageId = ''; // only the first file should connect to the root message for now.
  }
}

export function* receiveDelete(action) {
  const { channelId, messageId } = action.payload;

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
  let { channelId, message } = action.payload;

  const channel = yield select(rawChannelSelector(channelId));
  const currentMessages = channel?.messages || [];
  if (!channel || currentMessages.includes(message.id)) {
    return;
  }

  const preview = yield call(getPreview, message.message);

  if (preview) {
    message = { ...message, preview };
  }

  let newMessages = yield call(replaceOptimisticMessage, currentMessages, message);
  if (!newMessages) {
    newMessages = [
      ...currentMessages,
      message,
    ];
  }

  const updatedChannel: Partial<Channel> = { id: channelId, messages: newMessages };
  if (!channel.lastMessageCreatedAt || message.createdAt > channel.lastMessageCreatedAt) {
    updatedChannel.lastMessage = message;
    updatedChannel.lastMessageCreatedAt = message.createdAt;
  }

  yield put(receive(updatedChannel));
  yield spawn(sendBrowserNotification, channelId, message);

  const isChannel = yield select(_isChannel(channelId));
  const markAllAsReadAction = isChannel ? markChannelAsReadIfActive : markConversationAsReadIfActive;

  yield call(markAllAsReadAction, channelId);
}

export function* replaceOptimisticMessage(currentMessages, message) {
  if (!message.optimisticId) {
    return null;
  }
  const messageIndex = currentMessages.findIndex((id) => id === message.optimisticId);
  if (messageIndex < 0) {
    return null;
  }

  const optimisticMessage = yield select(messageSelector(message.optimisticId));
  if (optimisticMessage) {
    const messages = [...currentMessages];
    messages[messageIndex] = message;
    return messages;
  }

  return null;
}

export function* receiveUpdateMessage(action) {
  let { message } = action.payload;

  const preview = yield call(getPreview, message.message);
  message.preview = preview;

  yield put(receiveMessage(message));
}

export function* getPreview(message) {
  if (!message) return;

  const link: linkifyType[] = extractLink(message);
  if (!link.length) return;

  return yield call(getLinkPreviews, link[0].href);
}

function getCountNewMessages(messages: Message[] = [], lastMessageCreatedAt: number): number {
  return messages.filter((x) => x.createdAt > lastMessageCreatedAt).length;
}

function filteredLastMessage(messages: Message[]): Message {
  return messages[Object.keys(messages).pop()];
}

function* syncChannelsTask(action) {
  while (yield select(rawShouldSyncChannels(action.payload.channelId))) {
    yield call(fetchNewMessages, action);
    yield delay(FETCH_CHAT_CHANNEL_INTERVAL);
  }
}

export function* clearMessages() {
  yield put(removeAll({ schema: schema.key }));
}

export function isOwner(currentUser, entityUserId) {
  if (!currentUser || !entityUserId) return false;

  return currentUser.id === entityUserId;
}

export function* sendBrowserNotification(channelId, message: Message) {
  // This is not well defined. We need to respect muted channels, ignore messages from the current user, etc.
  const channel = yield select(rawChannelSelector(channelId));

  if (channel?.isChannel) return;

  if (isOwner(yield select(currentUserSelector()), message.sender?.userId)) return;

  yield call(sendBrowserMessage, mapMessage(message));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
  yield takeLatest(SagaActionTypes.Send, send);
  yield takeLatest(SagaActionTypes.DeleteMessage, deleteMessage);
  yield takeLatest(SagaActionTypes.EditMessage, editMessage);
  yield takeLatest(SagaActionTypes.startMessageSync, syncChannelsTask);
  yield takeLatest(SagaActionTypes.stopSyncChannels, stopSyncChannels);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageReceived, receiveNewMessage);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageUpdated, receiveUpdateMessage);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageDeleted, receiveDelete);
}
