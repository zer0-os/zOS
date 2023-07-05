import { currentUserSelector } from './../authentication/saga';
import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, delay, all } from 'redux-saga/effects';
import { EditMessageOptions, Message, SagaActionTypes, schema, removeAll, denormalize } from '.';
import { receive as receiveMessage } from './';
import { receive } from '../channels';
import { rawChannelSelector } from '../channels/saga';

import {
  deleteMessageApi,
  fetchMessagesByChannelId,
  sendMessagesByChannelId,
  editMessageApi,
  uploadFileMessage as uploadFileMessageApi,
  getLinkPreviews,
  uploadAttachment,
} from './api';
import { FileType, extractLink, getFileType, linkifyType, messageFactory } from './utils';
import { Media as MediaUtils } from '../../components/message-input/utils';
import { ParentMessage } from '../../lib/chat/types';
import { send as sendBrowserMessage, mapMessage } from '../../lib/browser';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';

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
}

export interface MediaPayload {
  channelId?: string;
  media: MediaUtils[];
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
}

export function* send(action) {
  const { channelId, message, mentionedUserIds, parentMessage } = action.payload;

  const { existingMessages, optimisticMessage } = yield call(
    createOptimisticMessage,
    channelId,
    message,
    parentMessage
  );

  yield call(createOptimisticPreview, channelId, optimisticMessage);
  yield call(performSend, channelId, message, mentionedUserIds, parentMessage, existingMessages);
}

export function* createOptimisticMessage(channelId, message, parentMessage) {
  // cloning the array to be able to push new cache id
  const cachedMessageIds = [...(yield select(getCachedMessageIds(channelId)))];

  const existingMessages = yield select(rawMessagesSelector(channelId));
  const currentUser = yield select(currentUserSelector());

  const temporaryMessage = messageFactory(message, currentUser, parentMessage);

  // add cache message id to prevent having double messages when we receive the message from sendbird.
  // We should set a reference id and post that to the server to be able to match the message when it
  // comes back around. Set the metadata on the message.
  cachedMessageIds.push(temporaryMessage.id);

  yield put(
    receive({
      id: channelId,
      messages: [
        ...existingMessages,
        temporaryMessage,
      ],
      lastMessage: temporaryMessage,
      lastMessageCreatedAt: temporaryMessage.createdAt,
      messageIdsCache: cachedMessageIds,
    })
  );

  return { existingMessages, optimisticMessage: temporaryMessage };
}

export function* createOptimisticPreview(channelId: string, optimisticMessage) {
  const preview = yield getPreview(optimisticMessage.message);

  if (preview) {
    yield put(receiveMessage({ id: optimisticMessage.id, preview }));
  }
}

export function* performSend(channelId, message, mentionedUserIds, parentMessage, existingMessages) {
  try {
    yield call(sendMessagesByChannelId, channelId, message, mentionedUserIds, parentMessage);
  } catch (e) {
    yield call(messageSendFailed, channelId, existingMessages);
  }
}

export function* messageSendFailed(channelId, existingMessages) {
  // Race condition here. What if we received a new message in the mean time?
  // We don't currently denormalize the lastMessage in the channel so we have to set
  // the full message and not just the id.
  const previousLastMessage = yield select((state) =>
    denormalize(existingMessages[existingMessages.length - 1], state)
  );
  yield put(
    receive({
      id: channelId,
      messages: [...existingMessages],
      lastMessage: previousLastMessage,
      lastMessageCreatedAt: previousLastMessage.createdAt,
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

export function* uploadFileMessage(action) {
  const { channelId, media } = action.payload;

  const existingMessages = yield select(rawMessagesSelector(channelId));

  if (!media.length) return;

  let messages = [...existingMessages];
  for (const file of media.filter((i) => i.nativeFile)) {
    if (!file.nativeFile) continue;

    const type = getFileType(file.nativeFile);
    if (type === FileType.Media) {
      const messagesResponse = yield call(uploadFileMessageApi, channelId, file.nativeFile);
      messages.push(messagesResponse);
    } else {
      const uploadResponse = yield call(uploadAttachment, file.nativeFile);
      const messagesResponse = yield call(
        sendMessagesByChannelId,
        channelId,
        undefined,
        undefined,
        undefined,
        uploadResponse
      );
      messages.push(messagesResponse.body);
    }
  }

  for (const file of media.filter((i) => i.giphy)) {
    const original = file.giphy.images.original;
    const giphyFile = { url: original.url, name: file.name, type: file.giphy.type };
    const messagesResponse = yield call(sendMessagesByChannelId, channelId, undefined, undefined, undefined, giphyFile);
    const message = messagesResponse.body;

    if (messagesResponse.status !== 200) return;

    messages.push(message);
  }

  yield put(
    receive({
      id: channelId,
      messages,
    })
  );
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

// this also "recieves" the message which I had just "sent". is that ideal or should we handle it?
export function* receiveNewMessage(action) {
  let { channelId, message } = action.payload;

  const cachedMessageIds = [...(yield select(getCachedMessageIds(channelId)))];
  const currentMessages = yield select(rawMessagesSelector(channelId));
  const preview = yield getPreview(message?.message);

  if (preview) {
    message = { ...message, preview };
  }

  let messages = [];
  if (cachedMessageIds.length) {
    messages = [
      ...currentMessages,
    ];

    // What is going on here? We set messages above but then we loop around
    // all the cached message ids... and map messages to something that might be a message or
    // might be a messageId... but only the last one in the list would ever impact
    // the messages array because...we keep overwriting it?
    cachedMessageIds.forEach((id, index, object) => {
      messages = messages.map((messageId) => {
        if (messageId === id && message.message && !message.image) {
          object.splice(index, 1);
          return message;
        } else {
          return messageId;
        }
      });
    });
  } else {
    const filteredCurrentMessages = currentMessages.filter((currentMessageId) => currentMessageId !== message.id);
    messages = [
      ...filteredCurrentMessages,
      message,
    ];
  }

  yield all([
    put(
      receive({
        id: channelId,
        messages,
        messageIdsCache: cachedMessageIds,
        lastMessage: message,
      })
    ),
    call(sendBrowserNotification, channelId, message),
  ]);
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
  yield takeLatest(SagaActionTypes.uploadFileMessage, uploadFileMessage);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageReceived, receiveNewMessage);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageUpdated, receiveUpdateMessage);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageDeleted, receiveDelete);
}
