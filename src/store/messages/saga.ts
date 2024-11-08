import { currentUserSelector } from './../authentication/saga';
import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, delay, spawn, takeEvery } from 'redux-saga/effects';
import {
  EditMessageOptions,
  SagaActionTypes,
  schema,
  removeAll,
  denormalize,
  MediaType,
  MessageSendStatus,
  MediaDownloadStatus,
} from '.';
import { receive as receiveMessage } from './';
import { ConversationStatus, MessagesFetchState, DefaultRoomLabels } from '../channels';
import { markConversationAsRead, rawChannelSelector, receiveChannel } from '../channels/saga';
import uniqBy from 'lodash.uniqby';

import { getLinkPreviews } from './api';
import { extractLink, linkifyType, createOptimisticMessageObject } from './utils';
import { ParentMessage } from '../../lib/chat/types';
import { send as sendBrowserMessage, mapMessage } from '../../lib/browser';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { Uploadable, createUploadableFile } from './uploadable';
import { chat, getMessageEmojiReactions, getMessageReadReceipts, sendEmojiReactionEvent } from '../../lib/chat';
import { User } from '../channels';
import { mapMessageSenders } from './utils.matrix';
import { uniqNormalizedList } from '../utils';
import { NotifiableEventType } from '../../lib/chat/matrix/types';
import { mapAdminUserIdToZeroUserId } from '../channels-list/utils';
import { ChatMessageEvents, getChatMessageBus } from './messages';
import { decryptFile } from '../../lib/chat/matrix/media';
import { getUserSubHandle } from '../../lib/user';

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

export const roomLabelSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels['${channelId}'].labels`, []);
};

export function* getLocalZeroUsersMap() {
  const users = yield select((state) => state.normalized.users || {});
  const zeroUsersMap: { [matrixId: string]: User } = {};
  for (const user of Object.values(users)) {
    zeroUsersMap[(user as User).matrixId] = user as User;
  }
  // map current user as well
  const currentUser = yield select(currentUserSelector());
  const displaySubHandle = getUserSubHandle(currentUser?.primaryZID, currentUser?.primaryWalletAddress);
  if (currentUser) {
    zeroUsersMap[currentUser.matrixId] = {
      userId: currentUser.id,
      profileId: currentUser.profileSummary.id,
      firstName: currentUser.profileSummary.firstName,
      lastName: currentUser.profileSummary.lastName,
      profileImage: currentUser.profileSummary.profileImage,
      displaySubHandle,
    } as User;
  }

  return zeroUsersMap;
}

export function* mapMessagesAndPreview(messages, channelId) {
  const reactions = yield call(getMessageEmojiReactions, channelId);

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

    const relatedReactions = reactions.filter((reaction) => reaction.eventId === message.id);
    if (relatedReactions.length > 0) {
      message.reactions = relatedReactions.reduce((acc, reaction) => {
        if (!reaction.key) return acc; // Skip if key is undefined
        acc[reaction.key] = (acc[reaction.key] || 0) + 1;
        return acc;
      }, message.reactions || {});
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

    if (yield select(_isActive(channelId))) {
      const currentUser = yield select(currentUserSelector());

      let latestUserMessage = null;
      for (let i = messages?.length - 1; i >= 0; i--) {
        const msg = messages[i];

        if (msg?.sender?.userId === currentUser?.id) {
          latestUserMessage = msg;

          break;
        }
      }

      if (latestUserMessage) {
        yield call(mapMessageReadByUsers, latestUserMessage.id, channelId);
      }
    }
  } catch (error) {
    console.log('Error fetching messages', error);
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
  yield call(publishMessageSent, channelId);
}

export function* publishMessageSent(channelId: string) {
  yield put(yield call(getChatMessageBus), { type: ChatMessageEvents.Sent, channelId });
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

  const result = yield sendMessage(messageCall, channelId, optimisticId);

  // Ensure media data is preserved in the sent message
  if (result && parentMessage) {
    result.parentMessageMedia = parentMessage.media;
  }

  return result;
}

// note: we're not replacing the optimistic message with the real message here anymore
// because we're now relying on receiving the real-time message event from matrix,
// which will replace the optimistic message
export function* sendMessage(apiCall, channelId, optimisticId) {
  try {
    return yield apiCall;
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
  const BATCH_INTERVAL = 500;

  savedMessages.push(action.payload);
  if (savedMessages.length > 1) {
    // we already have a leading event that's awaiting the debounce delay
    return;
  }
  yield delay(BATCH_INTERVAL);
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

  if (optimisticMessage.parentMessage) {
    message.parentMessageMedia = optimisticMessage.parentMessage.media;
  }

  const messages = [...currentMessages];
  messages[messageIndex] = {
    ...optimisticMessage,
    ...message,
    media: optimisticMessage.media,
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
    const previewResult = yield call(getLinkPreviews, firstUrl);
    if (previewResult.success) {
      return previewResult.body;
    } else {
      return null;
    }
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

  const roomLabels = yield select(roomLabelSelector(eventData?.roomId));
  if (roomLabels?.includes(DefaultRoomLabels.MUTE) || roomLabels?.includes(DefaultRoomLabels.ARCHIVED)) return;

  if (eventData.type === NotifiableEventType.RoomMessage) {
    yield call(sendBrowserMessage, mapMessage(eventData));
  }
}

export function* mapMessageReadByUsers(messageId, channelId) {
  const receipts = yield call(getMessageReadReceipts, channelId, messageId);
  if (receipts) {
    const zeroUsersMap: { [id: string]: User } = yield select((state) => state.normalized.users || {});

    const selectedMessage = yield select(messageSelector(messageId));
    const filteredReceipts = receipts.filter((receipt) => receipt.ts >= selectedMessage?.createdAt);
    const currentUser = yield select(currentUserSelector());

    const readByUsers = filteredReceipts
      .map((receipt) => {
        return Object.values(zeroUsersMap).find((user) => user.matrixId === receipt.userId);
      })
      .filter((user) => user && user.userId !== currentUser.id);

    yield put(receiveMessage({ id: messageId, readBy: readByUsers }));
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
  yield takeLatest(SagaActionTypes.Send, send);
  yield takeLatest(SagaActionTypes.DeleteMessage, deleteMessage);
  yield takeLatest(SagaActionTypes.EditMessage, editMessage);
  yield takeEvery(SagaActionTypes.LoadAttachmentDetails, loadAttachmentDetails);
  yield takeEvery(SagaActionTypes.SendEmojiReaction, sendEmojiReaction);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageReceived, receiveNewMessage);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageUpdated, receiveUpdateMessage);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageDeleted, receiveDelete);
  yield takeEveryFromBus(chatBus, ChatEvents.LiveRoomEventReceived, receiveLiveRoomEventAction);
  yield takeEveryFromBus(chatBus, ChatEvents.ReadReceiptReceived, readReceiptReceived);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageEmojiReactionChange, onMessageEmojiReactionChange);
}

function* receiveLiveRoomEventAction({ payload }) {
  yield sendBrowserNotification(payload.eventData);
}

function* readReceiptReceived({ payload }) {
  const { messageId, userId, roomId } = payload;

  if (yield select(_isActive(roomId))) {
    const zeroUsersMap: { [id: string]: User } = yield select((state) => state.normalized.users || {});
    const currentUser = yield select(currentUserSelector());

    const readByUser = Object.values(zeroUsersMap).find((user) => user.matrixId === userId);

    if (readByUser && readByUser.userId !== currentUser.id) {
      const selectedMessage = yield select(messageSelector(messageId));

      if (selectedMessage) {
        const updatedReadBy = [...(selectedMessage.readBy || []), readByUser];

        yield put(receiveMessage({ id: messageId, readBy: updatedReadBy }));
      }
    }
  }
}

const inProgress = {};
export function* loadAttachmentDetails(action) {
  const { media, messageId } = action.payload;

  if (
    inProgress[messageId] ||
    (media.url && !media.url.startsWith('mxc://')) ||
    media.downloadStatus === MediaDownloadStatus.Failed
  ) {
    return;
  }

  inProgress[messageId] = true;

  try {
    // Set status to 'LOADING'
    yield put(updateMediaStatus(messageId, media, MediaDownloadStatus.Loading));

    const blob = yield call(decryptFile, media.file || { url: media.url }, media.mimetype);
    const url = URL.createObjectURL(blob);

    if (!url) {
      yield put(updateMediaStatus(messageId, media, MediaDownloadStatus.Failed));
      return;
    }

    // Set status to 'SUCCESS' and update URL
    yield put(updateMediaStatus(messageId, media, MediaDownloadStatus.Success, url));
  } catch (error) {
    console.error('Failed to download and decrypt image:', error);

    // Set status to 'FAILED'
    yield put(updateMediaStatus(messageId, media, MediaDownloadStatus.Failed));
  } finally {
    inProgress[messageId] = false;
  }
}

function updateMediaStatus(messageId, media, downloadStatus, url = null) {
  return receiveMessage({
    id: messageId,
    media: { ...media, downloadStatus, ...(url && { url }) },
    image: url ? { ...media, url } : undefined,
  });
}

export function* sendEmojiReaction(action) {
  const { roomId, messageId, key } = action.payload;
  try {
    yield call(sendEmojiReactionEvent, roomId, messageId, key);
  } catch (error) {
    console.error('Error sending emoji reaction:', error);
  }
}

export function* onMessageEmojiReactionChange(action) {
  const { roomId, reaction } = action.payload;
  yield call(updateMessageEmojiReaction, roomId, reaction);
}

export function* updateMessageEmojiReaction(roomId, { eventId, key }) {
  const message = yield select(messageSelector(eventId));
  const existingMessages = yield select(rawMessagesSelector(roomId));

  if (message) {
    const newReactions = { ...message.reactions };
    newReactions[key] = (newReactions[key] || 0) + 1;

    const updatedMessage = { ...message, reactions: newReactions };
    const updatedMessages = existingMessages.map((message) => (message === eventId ? updatedMessage : message));

    yield call(receiveChannel, { id: roomId, messages: updatedMessages });
  }
}
