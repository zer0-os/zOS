import { v4 as uuidv4 } from 'uuid';
import { ChannelType, DirectMessage } from './types';
import getDeepProperty from 'lodash.get';
import uniqBy from 'lodash.uniqby';
import { takeLatest, put, call, take, race, all, select, spawn } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, receive, denormalizeConversations } from '.';
import { chat } from '../../lib/chat';

import {
  fetchConversations as fetchConversationsMessagesApi,
  createConversation as createConversationMessageApi,
  uploadImage as uploadImageApi,
} from './api';
import { AsyncListStatus } from '../normalized';
import { toLocalChannel, filterChannelsList } from './utils';
import { setactiveConversationId } from '../chat';
import { clearChannels } from '../channels/saga';
import { conversationsChannel } from './channels';
import { Events, getAuthChannel } from '../authentication/channels';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/saga';
import { ConversationStatus, GroupChannelType, MessagesFetchState, receive as receiveChannel } from '../channels';
import { AdminMessageType } from '../messages';
import { rawMessagesSelector, replaceOptimisticMessage } from '../messages/saga';

const FETCH_CHAT_CHANNEL_INTERVAL = 60000;

const rawAsyncListStatus = () => (state) => getDeepProperty(state, 'channelsList.status', 'idle');
const rawChannelsList = () => (state) => filterChannelsList(state, ChannelType.Channel);
export const rawConversationsList = () => (state) => filterChannelsList(state, ChannelType.DirectMessage);
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export function* fetchChannels(action) {
  yield put(setStatus(AsyncListStatus.Fetching));

  const chatClient = yield call(chat.get);
  const channelsList = yield call(
    [
      chatClient,
      chatClient.getChannels,
    ],
    action.payload
  );

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
  const conversationsList = conversations.map((currentChannel) => toLocalChannel(currentChannel));

  const existingConversationList = yield select(denormalizeConversations);
  const optimisticConversationIds = existingConversationList
    .filter((c) => c.conversationStatus !== ConversationStatus.CREATED)
    .map((c) => c.id);

  const channelsList = yield select(rawChannelsList());
  yield put(
    receive([
      ...channelsList,
      ...optimisticConversationIds,
      ...conversationsList,
    ])
  );

  // Publish a system message across the channel
  const channel = yield call(conversationsChannel);
  yield put(channel, { loaded: true });
}

export function* createConversation(userIds: string[], name: string = null, image: File = null) {
  const optimisticConversation = yield call(createOptimisticConversation, userIds, name, image);
  yield put(setactiveConversationId(optimisticConversation.id));
  try {
    const conversation = yield call(sendCreateConversationRequest, userIds, name, image, optimisticConversation.id);
    yield call(receiveCreatedConversation, conversation, optimisticConversation);
    return conversation;
  } catch {
    yield call(handleCreateConversationError, optimisticConversation);
  }
}

export function* handleCreateConversationError(optimisticConversation) {
  yield put(receiveChannel({ id: optimisticConversation.id, conversationStatus: ConversationStatus.ERROR }));
}

export function* createOptimisticConversation(userIds: string[], name: string = null, _image: File = null) {
  const defaultConversationProperties = {
    hasMore: false,
    isChannel: false,
    unreadCount: 0,
    hasLoadedMessages: true,
    messagesFetchStatus: MessagesFetchState.SUCCESS,
    groupChannelType: GroupChannelType.Private,
    shouldSyncChannels: false,
  };

  const currentUser = yield select(currentUserSelector());
  const id = uuidv4();
  const timestamp = Date.now();
  const adminMessage = {
    id,
    optimisticId: id,
    message: 'Conversation was started',
    createdAt: timestamp,
    isAdmin: true,
    admin: { type: AdminMessageType.CONVERSATION_STARTED, creatorId: currentUser.id },
  };
  const conversation = {
    ...defaultConversationProperties,
    id,
    optimisticId: id,
    name,
    otherMembers: userIds,
    messages: [adminMessage],
    createdAt: Date.now(),
    conversationStatus: ConversationStatus.CREATING,
    lastMessage: adminMessage,
    lastMessageAt: adminMessage.createdAt,
  };

  const existingConversationsList = yield select(rawConversationsList());
  const existingChannelsList = yield select(rawChannelsList());

  yield put(
    receive([
      ...existingConversationsList,
      ...existingChannelsList,
      conversation,
    ])
  );

  return conversation;
}

export function* receiveCreatedConversation(conversation, optimisticConversation) {
  const existingConversationsList = yield select(rawConversationsList());
  const listWithoutOptimistic = existingConversationsList.filter((id) => id !== optimisticConversation.id);

  if (!existingConversationsList.includes(conversation.id)) {
    conversation.hasLoadedMessages = true; // Brand new conversation doesn't have messages to load
    conversation.messagesFetchStatus = MessagesFetchState.SUCCESS;
    conversation.optimisticId = optimisticConversation.optimisticId;

    const existingMessageIds = yield select(rawMessagesSelector(optimisticConversation.id));
    const firstMessage = conversation.messages?.[0];
    if (firstMessage) {
      const channelMessages = yield call(replaceOptimisticMessage, existingMessageIds, firstMessage);
      if (channelMessages) {
        conversation.messages = channelMessages;
      }
    }
    listWithoutOptimistic.push(conversation);
  }

  const channelsList = yield select(rawChannelsList());
  yield put(
    receive([
      ...channelsList,
      ...listWithoutOptimistic,
    ])
  );

  yield put(setactiveConversationId(conversation.id));
}

export function* sendCreateConversationRequest(
  userIds: string[],
  name: string = null,
  image: File = null,
  optimisticId: string
) {
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

  const response: DirectMessage = yield call(createConversationMessageApi, userIds, name, coverUrl, optimisticId);

  const result = toLocalChannel(response);
  if (response.messages) {
    result.messages = response.messages;
  }
  return result;
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

  const newChannels = channels.map(toLocalChannel);

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

export function* userLeftChannel(channelId, userId) {
  const currentUser = yield select(currentUserSelector());

  if (userId === currentUser.id) {
    yield call(currentUserLeftChannel, channelId);
  }
}

function* currentUserLeftChannel(channelId) {
  const channelIdList = yield select((state) => getDeepProperty(state, 'channelsList.value', []));
  const newList = channelIdList.filter((id) => id !== channelId);
  yield put(receive(newList));

  const activeConversationId = yield select((state) => getDeepProperty(state, 'chat.activeConversationId', ''));
  if (activeConversationId === channelId) {
    const conversations = yield select(denormalizeConversations);

    if (conversations.length > 0) {
      const sorted = conversations.sort((a, b) => (b.lastMessage?.createdAt || 0) - (a.lastMessage?.createdAt || 0));
      yield put(setactiveConversationId(sorted[0].id));
    } else {
      // Probably not possible but handled just in case
      yield put(setactiveConversationId(null));
    }
  }
}

export function* saga() {
  yield spawn(listenForUserLogin);
  yield spawn(listenForUserLogout);
  yield takeLatest(SagaActionTypes.FetchChannels, fetchChannels);
  yield takeLatest(SagaActionTypes.StartChannelsAndConversationsAutoRefresh, startChannelsAndConversationsRefresh);
  yield takeLatest(SagaActionTypes.FetchConversations, fetchConversations);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.ChannelInvitationReceived, currentUserAddedToChannel);
  yield takeEveryFromBus(chatBus, ChatEvents.UserLeftChannel, ({ payload }) =>
    userLeftChannel(payload.channelId, payload.userId)
  );
}
