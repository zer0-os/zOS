import getDeepProperty from 'lodash.get';
import { put, call, take, select, spawn } from 'redux-saga/effects';
import { chat, downloadFile } from '../../lib/chat';

import { updateChannelWithRoomData } from './utils';
import { clearChannels, openConversation, openFirstConversation, receiveChannel } from '../channels/saga';
import { ConversationEvents, getConversationsBus } from './channels';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/selectors';
import { Channel, MessagesFetchState, removeChannel } from '../channels';
import { getUserByMatrixId } from '../users/saga';
import { channelSelector } from '../channels/selectors';
import { setIsConversationsLoaded } from '../chat';
import { clearLastActiveConversation } from '../../lib/last-conversation';
import { delay } from 'redux-saga/effects';
import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import matrixClientInstance from '../../lib/chat/matrix/matrix-client-instance';
import { MatrixAdapter } from '../../lib/chat/matrix/matrix-adapter';
import { userSelector } from '../users/selectors';
import { handleRoomDataEvents } from '../../lib/chat/matrix/event-type-handlers/handleRoomDataEvents';

export function* fetchChannels() {
  // Get initial channels from Matrix store for faster initial load
  const initChannels = yield call(MatrixAdapter.getChannels);
  for (const channel of initChannels) {
    yield call(receiveChannel, channel);
  }
  yield put(setIsConversationsLoaded(true));
  const conversationBus = yield call(getConversationsBus);
  yield put(conversationBus, { type: ConversationEvents.ConversationsLoaded });
  yield call(matrixClientInstance.waitForConnection);
  // Setup the channels with event handlers
  const chatClient = yield call(chat.get);
  yield call([chatClient, chatClient.setupConversations]);
}

export function* createConversation(userIds: string[], name: string = null, image: File = null) {
  const chatClient = yield call(chat.get);
  try {
    const users = yield select(userSelector, userIds);
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
    const users = yield select(userSelector, userIds);
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

function* listenForUserLogin() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogin);
    yield call(MatrixAdapter.matrixInitialized);
    yield call(fetchChannels);
  }
}

export function* userLeftChannel(channelId: string, matrixId: string) {
  const currentUser = yield select(currentUserSelector);

  if (matrixId === currentUser.matrixId) {
    yield call(currentUserLeftChannel, channelId);
  }
}

function* currentUserLeftChannel(channelId: string) {
  yield put(removeChannel(channelId));

  const activeConversationId = yield select((state) => getDeepProperty(state, 'chat.activeConversationId', ''));
  if (activeConversationId === channelId) {
    yield call(clearLastActiveConversation);
    yield call(openFirstConversation);
  }
}

type RoomDataAction = { payload: { roomId: string; roomData: MSC3575RoomData } };
let pendingRoomData: RoomDataAction['payload'][] = [];
function* batchedRoomDataAction(action: RoomDataAction) {
  pendingRoomData.push(action.payload);
  if (pendingRoomData.length > 1) {
    return;
  }

  yield delay(500);
  const batchedUpdates = [...pendingRoomData];
  pendingRoomData = [];

  for (const update of batchedUpdates) {
    yield call(handleRoomDataEvents, update.roomId, update.roomData, matrixClientInstance);
    if (update.roomData.initial) {
      const mappedChannel: Partial<Channel> = yield call(
        updateChannelWithRoomData,
        update.roomId,
        update.roomData,
        matrixClientInstance
      );
      yield spawn(receiveChannel, mappedChannel);
    }
  }
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
  yield otherUserJoinedChannel(payload.channelId, payload.userId);
}

function* otherUserLeftChannelAction({ payload }) {
  yield otherUserLeftChannel(payload.channelId, payload.userId);
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

export function* otherUserJoinedChannel(roomId: string, userId: string) {
  const channel = yield select(channelSelector(roomId));
  if (!channel) {
    return;
  }

  let user = yield call(getUserByMatrixId, userId);
  if (user && !channel?.otherMembers?.some(({ userId }) => userId === user.userId)) {
    const otherMembers = [...(channel?.otherMembers || []), user];
    yield call(receiveChannel, { id: channel.id, otherMembers });
  }
}

export function* otherUserLeftChannel(roomId: string, userId: string) {
  const channel = yield select(channelSelector(roomId));
  if (!channel) {
    return;
  }

  const existingUser = yield call(getUserByMatrixId, userId);
  if (!existingUser) {
    return;
  }

  const newMembers = channel?.otherMembers?.filter(({ userId }) => userId !== existingUser.userId) || [];
  yield call(receiveChannel, {
    id: channel.id,
    otherMembers: newMembers,
  });
}
