import { v4 as uuidv4 } from 'uuid';
import getDeepProperty from 'lodash.get';
import uniqBy from 'lodash.uniqby';
import { fork, put, call, take, all, select, spawn } from 'redux-saga/effects';
import { receive, denormalizeConversations, setStatus } from '.';
import { chat } from '../../lib/chat';
import { receive as receiveUser } from '../users';

import { AsyncListStatus } from '../normalized';
import { toLocalChannel, mapChannelMembers, mapChannelMessages } from './utils';
import { clearChannels, openConversation, openFirstConversation, receiveChannel } from '../channels/saga';
import { ConversationEvents, getConversationsBus } from './channels';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/selectors';
import { ConversationStatus, MessagesFetchState, User } from '../channels';
import { AdminMessageType } from '../messages';
import { rawMessagesSelector, replaceOptimisticMessage } from '../messages/saga';
import { getUserByMatrixId } from '../users/saga';
import { rawChannel } from '../channels/selectors';
import { getZEROUsers } from './api';
import { union } from 'lodash';
import { uniqNormalizedList } from '../utils';
import { channelListStatus, rawConversationsList } from './selectors';

export function* mapToZeroUsers(channels: any[]) {
  let allMatrixIds = [];
  for (const channel of channels) {
    const matrixIds = channel.memberHistory.map((u) => u.matrixId);
    allMatrixIds = union(allMatrixIds, matrixIds);
  }

  const zeroUsers = yield call(getZEROUsers, allMatrixIds);
  const zeroUsersMap = {};
  for (const user of zeroUsers) {
    zeroUsersMap[user.matrixId] = user;
  }

  yield call(mapChannelMembers, channels, zeroUsersMap);
  yield call(mapChannelMessages, channels, zeroUsersMap);
  return;
}

export function* fetchUserPresence(users) {
  const chatClient = yield call(chat.get);
  const uniqueUsers = uniqBy(users, (u) => u.matrixId);
  for (let user of uniqueUsers) {
    const matrixId = user.matrixId;
    if (!matrixId) continue;
    const presenceData = yield call([chatClient, chatClient.getUserPresence], matrixId);
    if (!presenceData) continue;
    const { lastSeenAt, isOnline } = presenceData;
    yield put(receiveUser({ userId: user.userId, lastSeenAt, isOnline }));
  }
}

export function* fetchConversations() {
  yield put(setStatus(AsyncListStatus.Fetching));
  const chatClient = yield call(chat.get);
  const conversations = yield call([
    chatClient,
    chatClient.getConversations,
  ]);

  yield call(mapToZeroUsers, conversations);

  const otherMembersOfConversations = conversations.flatMap((c) => c.otherMembers);
  yield fork(fetchUserPresence, otherMembersOfConversations);

  const existingConversationList = yield select(denormalizeConversations);
  const optimisticConversationIds = existingConversationList
    .filter((c) => c.conversationStatus !== ConversationStatus.CREATED)
    .map((c) => c.id);

  yield put(
    receive([
      ...optimisticConversationIds,
      ...conversations,
    ])
  );

  yield put(setStatus(AsyncListStatus.Stopped));

  // This event means an initial fetch of conversations has completed and is now in
  // state but it does not mean _all_ current known conversations are in state
  // as there are often follow up events still to be processed which would add
  // new conversations to the state. You may prefer waitForChatConnectionCompletion
  const channel = yield call(getConversationsBus);
  yield put(channel, { type: ConversationEvents.ConversationsLoaded });
}

export function userSelector(state, userIds) {
  return userIds.map((id) => (state.normalized.users || {})[id]);
}

export function* createConversation(userIds: string[], name: string = null, image: File = null) {
  const chatClient = yield call(chat.get);

  let optimisticConversation = { id: '', optimisticId: '' };
  if (yield call(chatClient.supportsOptimisticCreateConversation)) {
    optimisticConversation = yield call(createOptimisticConversation, userIds, name, image);
    yield call(openConversation, optimisticConversation.id);
  }

  try {
    const users = yield select(userSelector, userIds);
    const conversation = yield call(
      [chatClient, chatClient.createConversation],
      users,
      name,
      image,
      optimisticConversation.id
    );
    yield call(receiveCreatedConversation, conversation, optimisticConversation);
    return conversation;
  } catch {
    yield call(handleCreateConversationError, optimisticConversation);
  }
}

export function* handleCreateConversationError(optimisticConversation) {
  if (optimisticConversation) {
    yield call(receiveChannel, { id: optimisticConversation.id, conversationStatus: ConversationStatus.ERROR });
  }
}

export function* createOptimisticConversation(userIds: string[], name: string = null, _image: File = null) {
  const defaultConversationProperties = {
    hasMore: false,
    unreadCount: 0,
    hasLoadedMessages: true,
    messagesFetchStatus: MessagesFetchState.SUCCESS,
  };

  const currentUser = yield select(currentUserSelector);
  const id = uuidv4();
  const timestamp = Date.now();
  const adminMessage = {
    id,
    optimisticId: id,
    message: 'Conversation was started',
    createdAt: timestamp,
    isAdmin: true,
    admin: { type: AdminMessageType.CONVERSATION_STARTED, userId: currentUser.id },
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

  const existingConversationsList = yield select(rawConversationsList);

  yield put(
    receive([
      ...existingConversationsList,
      conversation,
    ])
  );

  return conversation;
}

export function* receiveCreatedConversation(conversation, optimisticConversation = { id: '', optimisticId: '' }) {
  if (!conversation) {
    return;
  }

  const existingConversationsList = yield select(rawConversationsList);
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

  yield put(receive(listWithoutOptimistic));
  yield call(openConversation, conversation.id);
}

export function* clearChannelsAndConversations() {
  yield all([
    call(clearChannels),
    put(receive([])),
  ]);
}

export function* fetchChannelsAndConversations() {
  if (String(yield select(channelListStatus)) !== AsyncListStatus.Stopped) {
    yield call(fetchConversations);
  }
}

export function* channelsReceived(action) {
  const { channels } = action.payload;

  const newChannels = channels.map(toLocalChannel);
  const existingDirectMessages = yield select(rawConversationsList);

  const newChannelList = uniqBy(
    [
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
    yield take(userChannel, AuthEvents.UserLogin);
    yield call(fetchChannelsAndConversations);
  }
}

export function* userLeftChannel(channelId, matrixId) {
  const currentUser = yield select(currentUserSelector);

  if (matrixId === currentUser.matrixId) {
    yield call(currentUserLeftChannel, channelId);
  }
}

function* currentUserLeftChannel(channelId) {
  const channelIdList = yield select((state) => getDeepProperty(state, 'channelsList.value', []));
  const newList = channelIdList.filter((id) => id !== channelId);
  yield put(receive(newList));

  const activeConversationId = yield select((state) => getDeepProperty(state, 'chat.activeConversationId', ''));
  if (activeConversationId === channelId) {
    yield call(openFirstConversation);
  }
}

function* clearOnLogout() {
  yield put(setStatus(AsyncListStatus.Idle));
}

export function* saga() {
  yield spawn(listenForUserLogin);
  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogout, clearOnLogout);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.UserLeftChannel, ({ payload }) =>
    userLeftChannel(payload.channelId, payload.userId)
  );
  yield takeEveryFromBus(chatBus, ChatEvents.UserJoinedChannel, userJoinedChannelAction);
  yield takeEveryFromBus(chatBus, ChatEvents.RoomNameChanged, roomNameChangedAction);
  yield takeEveryFromBus(chatBus, ChatEvents.RoomAvatarChanged, roomAvatarChangedAction);
  yield takeEveryFromBus(chatBus, ChatEvents.OtherUserJoinedChannel, otherUserJoinedChannelAction);
  yield takeEveryFromBus(chatBus, ChatEvents.OtherUserLeftChannel, otherUserLeftChannelAction);
}

function* userJoinedChannelAction({ payload }) {
  yield addChannel(payload.channel);

  const channel = yield call(getConversationsBus);
  yield put(channel, { type: ConversationEvents.UserJoinedConversation, conversationId: payload.channel.id });
}

function* roomNameChangedAction(action) {
  yield roomNameChanged(action.payload.id, action.payload.name);
}

function* roomAvatarChangedAction(action) {
  yield roomAvatarChanged(action.payload.id, action.payload.url);
}

function* otherUserJoinedChannelAction({ payload }) {
  yield otherUserJoinedChannel(payload.channelId, payload.user);
}

function* otherUserLeftChannelAction({ payload }) {
  yield otherUserLeftChannel(payload.channelId, payload.user);
}

export function* addChannel(channel) {
  const conversationsList = yield select(rawConversationsList);
  yield call(mapToZeroUsers, [channel]);
  yield fork(fetchUserPresence, channel.otherMembers);

  yield put(receive(uniqNormalizedList([...conversationsList, channel])));
}

export function* roomNameChanged(id: string, name: string) {
  yield call(receiveChannel, { id, name });
}

export function* roomAvatarChanged(id: string, url: string) {
  yield call(receiveChannel, { id, icon: url });
}

export function* otherUserJoinedChannel(roomId: string, user: User) {
  const channel = yield select(rawChannel, roomId);
  if (!channel) {
    return;
  }

  if (user.userId === user.matrixId) {
    user = yield call(getUserByMatrixId, user.matrixId) || user;
  }

  if (!channel?.otherMembers?.includes(user.userId)) {
    const otherMembers = [...(channel?.otherMembers || []), user];
    yield call(receiveChannel, { id: channel.id, isOneOnOne: otherMembers.length === 1, otherMembers });
  }
}

export function* otherUserLeftChannel(roomId: string, user: User) {
  const channel = yield select(rawChannel, roomId);
  if (!channel) {
    return;
  }

  const existingUser = yield call(getUserByMatrixId, user.matrixId);
  if (!existingUser) {
    return;
  }

  yield call(receiveChannel, {
    id: channel.id,
    otherMembers: channel?.otherMembers?.filter((userId) => userId !== existingUser.userId) || [],
  });
}
