import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, delay, takeEvery, spawn } from 'redux-saga/effects';
import {
  EditMessageOptions,
  SagaActionTypes,
  schema,
  removeAll,
  denormalize,
  MediaType,
  MessageSendStatus,
  Message,
  MessageWithoutSender,
} from '.';
import { receive as receiveMessage } from './';
import { ConversationStatus, MessagesFetchState, DefaultRoomLabels, User } from '../channels';
import { markConversationAsRead, receiveChannel } from '../channels/saga';

import { createOptimisticMessageObject } from './utils';
import { ParentMessage } from '../../lib/chat/types';
import { send as sendBrowserMessage, mapMessage } from '../../lib/browser';
import { currentUserSelector } from './../authentication/selectors';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { Uploadable, createUploadableFile } from './uploadable';
import { chat, getMessageEmojiReactions, getMessageReadReceipts, sendEmojiReactionEvent } from '../../lib/chat';
import { mapMessageSenders } from './utils.matrix';
import { NotifiableEventType } from '../../lib/chat/matrix/types';
import { ChatMessageEvents, getChatMessageBus } from './messages';
import { rawChannel } from '../channels/selectors';
import { getUsersByMatrixIds } from '../users/saga';
import { ReceiveNewMessageAction, ReceiveOptimisticMessageAction, SyncMessagesAction } from './types';

const BATCH_INTERVAL = 500; // Debounce/batch interval in milliseconds

export interface Payload {
  channelId: string;
  referenceTimestamp?: number;
  messageId?: string;
}
export interface SyncMessagesPayload {
  channelId: string;
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
  messageId?: string;
  message?: string;
  mentionedUserIds?: string[];
  data?: Partial<EditMessageOptions>;
}

export interface SendPayload {
  channelId?: string;
  message?: string;
  mentionedUserIds?: string[];
  parentMessage?: ParentMessage;
  parentMessageId?: string;
  parentMessageUserId?: string;
  file?: FileUploadResult;
  optimisticId?: string;
  files?: MediaInfo[];
  isSocialChannel?: boolean;
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

export function* mapMessagesAndPreview(messages: (Message | MessageWithoutSender)[], channelId: string) {
  const reactions = yield call(getMessageEmojiReactions, channelId);

  const messagesWithSenders = yield call(mapMessageSenders, messages);

  const newMessages = messagesWithSenders.map((message) => {
    if (message.isHidden) {
      message.message = 'Message hidden';
    }

    const relatedReactions = reactions.filter((reaction) => reaction.eventId === message.id);
    if (relatedReactions.length > 0) {
      message.reactions = relatedReactions.reduce((acc, reaction) => {
        if (!reaction.key) return acc; // Skip if key is undefined
        acc[reaction.key] = (acc[reaction.key] || 0) + 1;
        return acc;
      }, message.reactions || {});
    }

    return message;
  });

  return newMessages;
}

export function* fetchMessages(action) {
  const { channelId, referenceTimestamp } = action.payload;
  const channel = yield select((state) => rawChannel(state, channelId));
  if (channel.conversationStatus !== ConversationStatus.CREATED) {
    return;
  }

  let messagesResponse: any;
  try {
    const chatClient = yield call(chat.get);

    if (referenceTimestamp) {
      yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.MORE_IN_PROGRESS });
      messagesResponse = yield call([chatClient, chatClient.getMessagesByChannelId], channelId, referenceTimestamp);
    } else {
      yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.IN_PROGRESS });
      messagesResponse = yield call([chatClient, chatClient.getMessagesByChannelId], channelId);
    }

    const syncedMessages = yield call([chatClient, chatClient.syncChannelMessages], channelId);
    const messages = yield call(mapMessagesAndPreview, syncedMessages, channelId);

    yield call(receiveChannel, {
      id: channelId,
      messages,
      hasMore: messagesResponse.hasMore,
      hasLoadedMessages: true,
      messagesFetchStatus: MessagesFetchState.SUCCESS,
    });

    yield call(batchedUpdateLastMessage, [channelId]);

    if (yield select(_isActive(channelId))) {
      const currentUser = yield select(currentUserSelector);

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
    console.error('Error fetching messages', error);
    yield call(receiveChannel, { id: channelId, messagesFetchStatus: MessagesFetchState.FAILED });
  }
}

export function* send(action) {
  const { channelId, message, mentionedUserIds, parentMessage, files = [], isSocialChannel = false } = action.payload;

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
    const textMessage = yield call(
      performSend,
      channelId,
      message,
      mentionedUserIds,
      parentMessage,
      optimisticRootMessage.id,
      isSocialChannel
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
  const currentUser = yield select(currentUserSelector);

  const temporaryMessage = createOptimisticMessageObject(message, currentUser, parentMessage, file, rootMessageId);

  yield call(receiveChannel, { id: channelId, messages: [...existingMessages, temporaryMessage] });

  return { optimisticMessage: temporaryMessage };
}

export function* performSend(
  channelId,
  message,
  mentionedUserIds,
  parentMessage,
  optimisticId,
  isSocialChannel: boolean = false
) {
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
    optimisticId,
    isSocialChannel
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

export function* receiveNewMessageAction(action: ReceiveNewMessageAction) {
  const isActiveChannel = yield select(_isActive(action.payload.channelId));
  if (isActiveChannel) {
    yield call(scheduleActiveChannelMessageUpdate, action.payload.channelId);
  } else {
    yield call(receiveNewMessage, action.payload);
  }
}

let activeChannelDebounceMap: Record<string, boolean> = {};
export function* scheduleActiveChannelMessageUpdate(channelId: string) {
  if (activeChannelDebounceMap[channelId]) {
    return;
  }

  activeChannelDebounceMap[channelId] = true;

  try {
    yield delay(BATCH_INTERVAL);
    yield call(receiveActiveChannelMessage, channelId);
  } finally {
    activeChannelDebounceMap[channelId] = false;
  }
}

let newChannelIds: string[] = [];
function* receiveNewMessage(payload: ReceiveNewMessageAction['payload']) {
  newChannelIds.push(payload.channelId);
  if (newChannelIds.length > 1) {
    // we already have a leading event that's awaiting the debounce delay
    return;
  }
  yield delay(BATCH_INTERVAL);
  // Clone and empty so follow up events can debounce again
  const batchedChannelIds = [...newChannelIds];
  newChannelIds = [];
  return yield call(batchedUpdateLastMessage, [...new Set(batchedChannelIds)]);
}

/**
 * Batches the update of the last message for each channel.
 * @param channelIds - The list of channel ids to update the last message for
 */
export function* batchedUpdateLastMessage(channelIds: string[]) {
  for (const channelId of channelIds) {
    const chatClient = yield call(chat.get);
    let lastMessage = yield call([chatClient, chatClient.getLastChannelMessage], channelId);
    if (lastMessage) {
      const newLastMessageWithSender: Message[] | undefined = yield call(
        mapMessagesAndPreview,
        [lastMessage],
        channelId
      );
      yield call(receiveChannel, { id: channelId, lastMessage: newLastMessageWithSender?.[0] });
    }
  }
}

/**
 * Sync the redux state with the latest messages from the Matrix timeline
 * @param channelId - The id of the channel to sync
 */
export function* syncMessages(channelId: string) {
  const chatClient = yield call(chat.get);
  const messages = yield call([chatClient, chatClient.syncChannelMessages], channelId);
  if (messages) {
    const messagesWithSenders = yield call(mapMessagesAndPreview, messages, channelId);
    yield call(receiveChannel, { id: channelId, messages: messagesWithSenders });
  }
}

export function* syncMessagesAction(action: SyncMessagesAction) {
  const { channelId } = action.payload;
  yield call(syncMessages, channelId);
}

export function* receiveActiveChannelMessage(channelId: string) {
  yield call(syncMessages, channelId);
  // Mark the conversation as read since the user is actively viewing it
  yield spawn(markConversationAsRead, channelId);
}

export function* receiveOptimisticMessage(action: ReceiveOptimisticMessageAction) {
  const { message, roomId } = action.payload;
  // hydrate message with redux data
  const newMessage: Message[] = yield call(mapMessagesAndPreview, [message], roomId);
  const channel = yield select((state) => rawChannel(state, roomId));
  const existingMessages = channel.messages;
  // replace the optimistic message with the real message
  const newMessages: (string | Message)[] | null = yield call(
    replaceOptimisticMessage,
    existingMessages,
    newMessage[0]
  );
  if (!newMessages || !newMessage[0]) {
    return;
  }
  const fullMessage = newMessages.find((message) => typeof message !== 'string' && message.id === newMessage[0].id) as
    | Message
    | undefined;
  if (!fullMessage) {
    return;
  }
  // update the last message if the new message is more recent
  let lastMessage = channel.lastMessage;
  if (fullMessage.createdAt > channel.lastMessage?.createdAt) {
    lastMessage = fullMessage;
  }
  yield call(receiveChannel, { id: roomId, messages: newMessages, lastMessage });
}

export function* replaceOptimisticMessage(currentMessages: string[], message: Message) {
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

export function* clearMessages() {
  yield put(removeAll({ schema: schema.key }));
}

export function isOwner(currentUser, entityUserMatrixId) {
  if (!currentUser || !entityUserMatrixId) return false;

  return currentUser.matrixId === entityUserMatrixId;
}

export function* sendBrowserNotification(eventData) {
  if (isOwner(yield select(currentUserSelector), eventData.sender?.userId)) return;

  const roomLabels = yield select(roomLabelSelector(eventData?.roomId));
  if (roomLabels?.includes(DefaultRoomLabels.MUTE) || roomLabels?.includes(DefaultRoomLabels.ARCHIVED)) return;

  if (eventData.type === NotifiableEventType.RoomMessage) {
    yield call(sendBrowserMessage, mapMessage(eventData));
  }
}

export function* mapMessageReadByUsers(messageId, channelId) {
  const receipts = yield call(getMessageReadReceipts, channelId, messageId);
  if (receipts) {
    const zeroUsersMap: Map<string, User> = yield call(
      getUsersByMatrixIds,
      receipts.map((receipt) => receipt.userId)
    );

    const currentUser = yield select(currentUserSelector);

    const readByUsers = receipts
      .map((receipt) => {
        return zeroUsersMap.get(receipt.userId);
      })
      .filter((user) => user && user.userId !== currentUser.id);

    yield put(receiveMessage({ id: messageId, readBy: readByUsers }));
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetchMessages);
  yield takeLatest(SagaActionTypes.SyncMessages, syncMessagesAction);
  yield takeLatest(SagaActionTypes.Send, send);
  yield takeLatest(SagaActionTypes.DeleteMessage, deleteMessage);
  yield takeLatest(SagaActionTypes.EditMessage, editMessage);
  yield takeEvery(SagaActionTypes.SendEmojiReaction, sendEmojiReaction);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageReceived, receiveNewMessageAction);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageUpdated, receiveUpdateMessage);
  yield takeEveryFromBus(chatBus, ChatEvents.MessageDeleted, receiveDelete);
  yield takeEveryFromBus(chatBus, ChatEvents.OptimisticMessageUpdated, receiveOptimisticMessage);
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
    const currentUser = yield select(currentUserSelector);

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
