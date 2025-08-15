import getDeepProperty from 'lodash.get';
import { put, call, select, spawn, fork, delay } from 'redux-saga/effects';
import { chat, downloadFile } from '../../lib/chat';

import { updateChannelWithRoomData } from './utils';
import { clearChannels, openConversation, openFirstConversation, receiveChannel } from '../channels/saga';
import { ConversationEvents, getConversationsBus } from './channels';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/selectors';
import { Channel, MessagesFetchState, removeChannel } from '../channels';
import { channelSelector } from '../channels/selectors';
import { setIsConversationsLoaded } from '../chat';
import { clearLastActiveConversation } from '../../lib/last-conversation';
import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import Matrix from '../../lib/chat/matrix/matrix-client-instance';
import { handleRoomDataEvents } from './event-type-handlers/handle-room-data-events';
import { batchedUpdateLastMessage } from '../messages/saga';
import { getUsersByUserIds } from '../users/saga';

export function* fetchChannels() {
  // Get initial channels from Matrix store for faster initial load
  const chatClient = yield call(chat.get);
  const initChannels = yield call([chatClient, chatClient.getChannels]);
  for (const channel of initChannels) {
    yield call(receiveChannel, channel);
  }
  yield put(setIsConversationsLoaded(true));
  const conversationBus = yield call(getConversationsBus);
  yield put(conversationBus, { type: ConversationEvents.ConversationsLoaded });
  yield call(Matrix.client.waitForConnection);
  // Setup the channels with event handlers
  yield call([chatClient, chatClient.setupConversations]);
}

export function* createConversation(userIds: string[], name: string = null, image: File = null) {
  const chatClient = yield call(chat.get);
  try {
    const usersMap = yield call(getUsersByUserIds, userIds);
    const users = Array.from(usersMap.values());
    const conversation = yield call([chatClient, chatClient.createConversation], users, name, image);
    yield call(receiveCreatedConversation, conversation);
    return conversation;
  } catch {}
}

export function* createUnencryptedConversation(
  userIds: string[],
  name: string = null,
  image: File = null,
  groupType?: string
) {
  const chatClient = yield call(chat.get);
  try {
    const usersMap = yield call(getUsersByUserIds, userIds);
    const users = Array.from(usersMap.values());
    const channel = yield call([chatClient, chatClient.createUnencryptedConversation], users, name, image, groupType);
    yield call(receiveCreatedConversation, channel);
    return channel;
  } catch {}
}

export function* receiveCreatedConversation(conversation: Partial<Channel>) {
  if (!conversation) {
    return;
  }

  const newConversation: Partial<Channel> = { ...conversation };
  newConversation.hasLoadedMessages = true;
  newConversation.messagesFetchStatus = MessagesFetchState.SUCCESS;

  yield call(receiveChannel, newConversation);
  yield call(openConversation, newConversation.id);
}

export function* clearChannelsAndConversations() {
  yield call(clearChannels);
}

function* handleUserLogin() {
  const chatClient = yield call(chat.get);
  yield call([chatClient, chatClient.waitForConnection]);
  yield call(fetchChannels);
}

function* listenForUserLogin() {
  const userChannel = yield call(getAuthChannel);
  yield takeEveryFromBus(userChannel, AuthEvents.UserLogin, handleUserLogin);
}

export function* userLeftChannel(channelId: string, matrixId: string) {
  const currentUser = yield select(currentUserSelector);

  if (matrixId === currentUser.matrixId) {
    yield call(currentUserLeftChannel, channelId);
  }
}

function* currentUserLeftChannel(channelId: string) {
  const channel = yield select(channelSelector(channelId));

  // If channel is already undefined, it was already processed - skip
  if (!channel) {
    return;
  }

  const isSocialChannel = channel?.isSocialChannel;

  yield put(removeChannel(channelId));

  const activeConversationId = yield select((state) => getDeepProperty(state, 'chat.activeConversationId', ''));
  if (activeConversationId === channelId) {
    // Only open first conversation for non-social channels
    // For social channels (including token-gated), we want to stay on the same page and show the join screen
    if (!isSocialChannel) {
      yield call(clearLastActiveConversation);
      yield call(openFirstConversation);
    }
  }
}

type RoomDataAction = { payload: { roomId: string; roomData: MSC3575RoomData } };
let pendingRoomData: RoomDataAction['payload'][] = [];
/**
 * Batches room data events from Sliding Sync. MSC3575RoomData contains various information about the room,
 * based on the room subscription list in sliding-sync.ts
 * @param action The room data action.
 */
function* batchedRoomDataAction(action: RoomDataAction) {
  pendingRoomData.push(action.payload);
  if (pendingRoomData.length > 1) {
    return;
  }

  yield delay(500);
  const batchedUpdates = [...pendingRoomData];
  pendingRoomData = [];

  for (const update of batchedUpdates) {
    yield call(handleRoomDataEvents, update.roomId, update.roomData, Matrix.client);
    if (update.roomData.initial) {
      const mappedChannel: Partial<Channel> = yield call(updateChannelWithRoomData, update.roomId, update.roomData);
      yield spawn(receiveChannel, mappedChannel);
    }
  }
  const channelIds = batchedUpdates.map((update) => update.roomId);
  yield call(batchedUpdateLastMessage, channelIds);
}

export function* saga() {
  yield spawn(listenForUserLogin);

  const chatBus = yield call(getChatBus);
  yield takeEveryFromBus(chatBus, ChatEvents.UserLeftChannel, ({ payload }) =>
    userLeftChannel(payload.channelId, payload.userId)
  );
  yield takeEveryFromBus(chatBus, ChatEvents.UserJoinedChannel, userJoinedChannelAction);
  yield takeEveryFromBus(chatBus, ChatEvents.RoomNameChanged, roomNameChangedAction);
  yield takeEveryFromBus(chatBus, ChatEvents.RoomAvatarChanged, roomAvatarChangedAction);
  yield takeEveryFromBus(chatBus, ChatEvents.RoomGroupTypeChanged, roomGroupTypeChangedAction);
  yield takeEveryFromBus(chatBus, ChatEvents.OtherUserJoinedChannel, otherUserJoinedChannelAction);
  yield takeEveryFromBus(chatBus, ChatEvents.OtherUserLeftChannel, otherUserLeftChannelAction);
  yield takeEveryFromBus(chatBus, ChatEvents.RoomData, batchedRoomDataAction);
}

function* userJoinedChannelAction({ payload }) {
  const conversationBus = yield call(getConversationsBus);
  yield put(conversationBus, { type: ConversationEvents.UserJoinedConversation, conversationId: payload.channelId });
}

function* roomNameChangedAction(action) {
  yield roomNameChanged(action.payload.id, action.payload.name);
}

function* roomAvatarChangedAction(action) {
  yield roomAvatarChanged(action.payload.id, action.payload.url);
}

function* roomGroupTypeChangedAction(action) {
  yield roomGroupTypeChanged(action.payload.id, action.payload.groupType);
}

function* otherUserJoinedChannelAction({ payload }) {
  yield fork(roomMemberUpdated, payload.channelId);
}

function* otherUserLeftChannelAction({ payload }) {
  yield fork(roomMemberUpdated, payload.channelId);
}

export function* roomNameChanged(id: string, name: string) {
  yield call(receiveChannel, { id, name });
}

export function* roomAvatarChanged(id: string, url: string) {
  if (!url) {
    return;
  }

  const localImageUrl = yield call(downloadFile, url);
  yield call(receiveChannel, { id, icon: localImageUrl });
}

export function* roomGroupTypeChanged(id: string, type: string) {
  yield call(receiveChannel, { id, isSocialChannel: type === 'social' });
}

const roomTimeouts = new Map<string, any>();
function* processRoomUpdate(roomId: string) {
  const channel = yield select(channelSelector(roomId));
  if (!channel) return;

  const chatClient = yield call(chat.get);
  const members = yield call([chatClient, chatClient.getChannelMembers], roomId);
  if (members) {
    yield call(receiveChannel, {
      id: channel.id,
      otherMembers: members.otherMembers,
      memberHistory: members.memberHistory,
      totalMembers: members.totalMembers,
    });
  }
}

export function* roomMemberUpdated(roomId: string) {
  // Cancel any existing timeout for this room
  if (roomTimeouts.has(roomId)) {
    roomTimeouts.get(roomId).cancel();
  }

  // Create a new timeout
  const timeout = yield spawn(function* () {
    yield delay(1000);
    roomTimeouts.delete(roomId);
    yield call(processRoomUpdate, roomId);
  });

  roomTimeouts.set(roomId, timeout);
}
