import { currentUserSelector } from './../authentication/saga';
import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, delay, spawn } from 'redux-saga/effects';
import { EditMessageOptions, SagaActionTypes, schema, removeAll, denormalize, MediaType, MessageSendStatus } from '.';
import { receive as receiveMessage } from './';
import { ConversationStatus, MessagesFetchState } from '../channels';
import { markConversationAsRead, rawChannelSelector, receiveChannel } from '../channels/saga';
import uniqBy from 'lodash.uniqby';

import { getLinkPreviews } from './api';
import { extractLink, linkifyType, createOptimisticMessageObject } from './utils';
import { ParentMessage } from '../../lib/chat/types';
import { send as sendBrowserMessage, mapMessage } from '../../lib/browser';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { Uploadable, createUploadableFile } from './uploadable';
import { chat } from '../../lib/chat';
import { User } from '../channels';
import { mapMessageSenders } from './utils.matrix';
import { uniqNormalizedList } from '../utils';
import { NotifiableEventType } from '../../lib/chat/matrix/types';
import { mapAdminUserIdToZeroUserId } from '../channels-list/utils';
import { ChatMessageEvents, getChatMessageBus } from './messages';

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

export const rawMessagesSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels['${channelId}'].messages`, []);
};

export const messageSelector = (messageId) => (state) => {
  return getDeepProperty(state, `normalized.messages[${messageId}]`, null);
};

const _isActive = (roomId) => (state) => {
  return roomId === state.chat.activeConversationId;
};

export function* getLocalZeroUsersMap() {
  const users = yield select((state) => state.normalized.users || {});
  const zeroUsersMap: { [matrixId: string]: User } = {};
  for (const user of Object.values(users)) {
    zeroUsersMap[(user as User).matrixId] = user as User;
  }
  // map current user as well
  const currentUser = yield select(currentUserSelector());
  if (currentUser) {
    zeroUsersMap[currentUser.matrixId] = {
      userId: currentUser.id,
      profileId: currentUser.profileSummary.id,
      firstName: currentUser.profileSummary.firstName,
      lastName: currentUser.profileSummary.lastName,
      profileImage: currentUser.profileSummary.profileImage,
    } as User;
  }

  return zeroUsersMap;
}

export function* mapMessagesAndPreview(messages, channelId) {
  const zeroUsersMap = yield call(mapMessageSenders, messages, channelId);
  yield call(mapAdminUserIdToZeroUserId, [{ messages }], zeroUsersMap);
  for (const message of messages) {
    if (message.isHidden) {
      message.message = 'Message hidden';
    }

    const preview = yield call(getPreview, message.message);
    if (preview) {
      message.preview = preview;
    }
  }

  return messages;
}

export function* fetch(action) {
  const { channelId, referenceTimestamp } = action.payload;
  const channel = yield select(rawChannelSelector(channelId));
  if (channel.conversationStatus !== ConversationStatus.CREATED) {
    return;
  }

  let messagesResponse: any;
  let messages: any[];

  try {
    const chatClient = yield call(chat.get);

    if (referenceTimestamp) {
      yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.MORE_IN_PROGRESS });
      messagesResponse = yield call([chatClient, chatClient.getMessagesByChannelId], channelId, referenceTimestamp);
    } else {
      yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.IN_PROGRESS });
      messagesResponse = yield call([chatClient, chatClient.getMessagesByChannelId], channelId);
    }

    messagesResponse.messages = yield call(mapMessagesAndPreview, messagesResponse.messages, channelId);
    const existingMessages = yield select(rawMessagesSelector(channelId));

    // we prefer this order (new messages first), so that if any new message has an updated property
    // (eg. parentMessage), then it gets written to state
    messages = [...messagesResponse.messages, ...existingMessages];
    messages = uniqBy(messages, (m) => m.id ?? m);

    yield call(receiveChannel, {
      id: channelId,
      messages,
      hasMore: messagesResponse.hasMore,
      hasLoadedMessages: true,
      messagesFetchStatus: MessagesFetchState.SUCCESS,
    });
  } catch (error) {
    yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.FAILED });
  }
}

export function* send(action) {
  const { channelId, message, mentionedUserIds, parentMessage, files = [] } = action.payload;

  const processedFiles: Uploadable[] = files.map(createUploadableFile);

  const { optimisticRootMessage, uploadableFiles } = yield call(
    createOptimisticMessages,
    channelId,
    message,
    parentMessage,
    processedFiles
  );

  let rootMessageId = '';
  if (optimisticRootMessage) {
    yield spawn(createOptimisticPreview, channelId, optimisticRootMessage);

    const textMessage = yield call(
      performSend,
      channelId,
      message,
      mentionedUserIds,
      parentMessage,
      optimisticRootMessage.id
    );

    if (textMessage) {
      rootMessageId = textMessage.id;
    } else {
      // If the text message failed, we'll leave the first file as unsent
      uploadableFiles.shift();
    }
  }

  yield call(uploadFileMessages, channelId, rootMessageId, uploadableFiles);
  yield call(publishMessageSent);
}

export function* publishMessageSent() {
  yield put(yield call(getChatMessageBus), { type: ChatMessageEvents.Sent });
}

export function* createOptimisticMessages(channelId, message, parentMessage, uploadableFiles?) {
  let optimisticRootMessage = null;
  if (message?.trim()) {
    const { optimisticMessage } = yield call(createOptimisticMessage, channelId, message, parentMessage);
    optimisticRootMessage = optimisticMessage;
  }

  for (const index in uploadableFiles) {
    const file = uploadableFiles[index].file;
    // only the first file should connect to the root message for now.
    const rootId = index === '0' ? optimisticRootMessage?.id : '';
    const { optimisticMessage } = yield call(createOptimisticMessage, channelId, '', null, file, rootId);
    uploadableFiles[index].optimisticMessage = optimisticMessage;
  }

  return { optimisticRootMessage, uploadableFiles };
}

export function* createOptimisticMessage(channelId, message, parentMessage, file?, rootMessageId?) {
  const existingMessages = yield select(rawMessagesSelector(channelId));
  const currentUser = yield select(currentUserSelector());

  const temporaryMessage = createOptimisticMessageObject(message, currentUser, parentMessage, file, rootMessageId);

  yield call(receiveChannel, { id: channelId, messages: [...existingMessages, temporaryMessage] });

  return { optimisticMessage: temporaryMessage };
}

export function* createOptimisticPreview(channelId: string, optimisticMessage) {
  const url = getFirstUrl(optimisticMessage.message);
  if (!url) {
    return;
  }

  yield put(receiveMessage({ id: optimisticMessage.id, preview: { url } }));
  const preview = yield getPreview(optimisticMessage.message);

  if (preview) {
    yield put(receiveMessage({ id: optimisticMessage.id, preview }));
    // In case the optimistic message has been replaced by a real message
    const existingMessageIds = yield select(rawMessagesSelector(channelId));
    const fullMessages = yield select((state) => denormalize(existingMessageIds, state));
    const message = fullMessages.find((m) => m.optimisticId === optimisticMessage.id);
    if (message) {
      yield put(receiveMessage({ id: message.id, preview }));
    }
  }
}

export function* performSend(channelId, message, mentionedUserIds, parentMessage, optimisticId) {
  const chatClient = yield call(chat.get);

  const messageCall = call(
    [
      chatClient,
      chatClient.sendMessagesByChannelId,
    ],
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
      yield call(receiveChannel, { id: channelId, messages: messages });
    }
    return createdMessage;
  } catch (e) {
    yield call(messageSendFailed, optimisticId);
    return null;
  }
}

export function* messageSendFailed(optimisticId) {
  yield put(
    receiveMessage({
      id: optimisticId,
      sendStatus: MessageSendStatus.FAILED,
    })
  );
}

export function* deleteMessage(action) {
  const { channelId, messageId } = action.payload;

  const existingMessageIds = yield select(rawMessagesSelector(channelId));
  const fullMessages = yield select((state) => denormalize(existingMessageIds, state));

  const messageIdsToDelete = fullMessages.filter((m) => m.rootMessageId === messageId.toString()).map((m) => m.id); // toString() because message ids are currently a number

  messageIdsToDelete.unshift(messageId);

  yield call(receiveChannel, {
    id: channelId,
    messages: existingMessageIds.filter((id) => !messageIdsToDelete.includes(id)),
  });

  const nonOptimisticMessagesIds = fullMessages
    .filter((m) => messageIdsToDelete.includes(m.id))
    .filter((m) => m.id !== m.optimisticId)
    .map((m) => m.id);

  const chatClient = yield call(chat.get);

  // In the future we'd prefer that the api did this so that the front-ends
  // could treat these as independent messages. However, given that we have
  // multiple front ends and they don't all support treating these messages
  // as a single entity yet, this is how we'll do it for now.
  for (let id of nonOptimisticMessagesIds) {
    yield call([chatClient, chatClient.deleteMessageByRoomId], channelId, id);
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

  yield call(receiveChannel, { id: channelId, messages });

  const chatClient = yield call(chat.get);
  const messagesResponse = yield call(
    [chatClient, chatClient.editMessage],
    channelId,
    messageId,
    message,
    mentionedUserIds,
    data
  );

  const isMessageSent = messagesResponse === 200;

  if (!isMessageSent) {
    yield call(receiveChannel, { id: channelId, messages: [...existingMessages] });
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

  yield call(receiveChannel, { id: channelId, messages: existingMessages.filter((id) => id !== messageId) });
}

let savedMessages = [];
export function* receiveNewMessage(action) {
  savedMessages.push(action.payload);
  if (savedMessages.length > 1) {
    // we already have a leading event that's awaiting the debounce delay
    return;
  }
  yield delay(500);
  // Clone and empty so follow up events can debounce again
  const batchedPayloads = [...savedMessages];
  savedMessages = [];
  return yield call(batchedReceiveNewMessage, batchedPayloads);
}

export function* batchedReceiveNewMessage(batchedPayloads) {
  const byChannelId = {};
  batchedPayloads.forEach((m) => {
    byChannelId[m.channelId] = byChannelId[m.channelId] || [];
    byChannelId[m.channelId].push(m.message);
  });

  for (const channelId of Object.keys(byChannelId)) {
    const channel = yield select(rawChannelSelector(channelId));
    if (!channel) {
      continue;
    }

    const mappedMessages = yield call(mapMessagesAndPreview, byChannelId[channelId], channelId);
    yield receiveBatchedMessages(channelId, mappedMessages);

    if (yield select(_isActive(channelId))) {
      yield spawn(markConversationAsRead, channelId);
    }
  }
}

function* receiveBatchedMessages(channelId, messages) {
  // Note: This method must be fully synchronous. There can be no
  // async calls in here because we fetch the current list of channel
  // messages and replace things and then set the new list at the end.
  // If there is an async call in between then the channels list of messages
  // could have changed and we'll end up missing those changes by the time we
  // save the batch here.
  const currentChannel = yield select(rawChannelSelector(channelId));
  let currentMessages = currentChannel?.messages || [];
  for (let message of messages) {
    let newMessages = yield call(replaceOptimisticMessage, currentMessages, message);
    if (!newMessages) {
      newMessages = [...currentMessages, message];
    }
    currentMessages = newMessages;
  }
  yield call(receiveChannel, { id: channelId, messages: uniqNormalizedList(currentMessages, true) });
}

export function* replaceOptimisticMessage(currentMessages, message) {
  const messageIndex = currentMessages.findIndex((id) => id === message.optimisticId);
  if (messageIndex < 0) {
    return null;
  }

  const optimisticMessage = yield select(messageSelector(message.optimisticId));
  if (!optimisticMessage) {
    return null; // This shouldn't happen because we'd have bailed above, but just in case.
  }

  const messages = [...currentMessages];
  messages[messageIndex] = {
    ...optimisticMessage,
    ...message,
    sendStatus: MessageSendStatus.SUCCESS,
  };
  return messages;
}

export function* receiveUpdateMessage(action) {
  let { message, channelId } = action.payload;

  const messageList = yield call(mapMessagesAndPreview, [message], channelId);
  message = messageList[0];

  yield put(receiveMessage(message));
}

export function* getPreview(message) {
  if (!message) return;

  const firstUrl = getFirstUrl(message);
  if (firstUrl) {
    return yield call(getLinkPreviews, firstUrl);
  }
}

function getFirstUrl(message: string) {
  const link: linkifyType[] = extractLink(message);
  if (!link.length) return;
  return link[0].href;
}

export function* clearMessages() {
  yield put(removeAll({ schema: schema.key }));
}

export function isOwner(currentUser, entityUserMatrixId) {
  if (!currentUser || !entityUserMatrixId) return false;

  return currentUser.matrixId === entityUserMatrixId;
}

export function* sendBrowserNotification(eventData) {
  if (isOwner(yield select(currentUserSelector()), eventData.sender?.userId)) return;

  if (eventData.type === NotifiableEventType.RoomMessage) {
    yield call(sendBrowserMessage, mapMessage(eventData));
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
  yield takeLatest(SagaActionTypes.Send, send);
  yield takeLatest(SagaActionTypes.DeleteMessage, deleteMessage);
  yield takeLatest(SagaActionTypes.EditMessage, editMessage);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageReceived, receiveNewMessage);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageUpdated, receiveUpdateMessage);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageDeleted, receiveDelete);
  yield takeEveryFromBus(chatBus, ChatEvents.LiveRoomEventReceived, receiveLiveRoomEventAction);
}

function* receiveLiveRoomEventAction({ payload }) {
  yield sendBrowserNotification(payload.eventData);
}
