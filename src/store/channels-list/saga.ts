import getDeepProperty from 'lodash.get';
import { fork, put, call, take, all, select, spawn } from 'redux-saga/effects';
import { receive, setStatus } from '.';
import { chat, downloadFile } from '../../lib/chat';

import { AsyncListStatus } from '../normalized';
import { updateChannelWithRoomData } from './utils';
import {
  clearChannels,
  loadMembersIfNeeded,
  openConversation,
  openFirstConversation,
  receiveChannel,
} from '../channels/saga';
import { ConversationEvents, getConversationsBus } from './channels';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/selectors';
import { Channel, MessagesFetchState } from '../channels';
import { replaceOptimisticMessage } from '../messages/saga';
import { getUserByMatrixId } from '../users/saga';
import { channelSelector } from '../channels/selectors';
import { channelListStatus, rawConversationsList } from './selectors';
import { setIsConversationsLoaded } from '../chat';
import { clearLastActiveConversation } from '../../lib/last-conversation';
import { delay } from 'redux-saga/effects';
import { MSC3575RoomData } from 'matrix-js-sdk/lib/sliding-sync';
import matrixClientInstance from '../../lib/chat/matrix/matrix-client-instance';
import { MatrixAdapter } from '../../lib/chat/matrix/matrix-adapter';
import { userSelector } from './selectors';
import { MembershipStateType } from '../../lib/chat/matrix/types';

export function* fetchChannels() {
  yield put(setStatus(AsyncListStatus.Fetching));
  // Get initial channels from Matrix store for faster initial load
  const initChannels = yield call(MatrixAdapter.getChannels);
  yield put(receive(initChannels));
  yield put(setStatus(AsyncListStatus.Stopped));
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

  const existing = yield select(channelSelector(conversation.id));

  const newConversation: Partial<Channel> = { ...existing, ...conversation };
  newConversation.hasLoadedMessages = true;
  newConversation.messagesFetchStatus = MessagesFetchState.SUCCESS;

  const channels = yield select(rawConversationsList);
  yield put(receive([...channels, newConversation]));
  yield call(openConversation, newConversation.id);
}

export function* clearChannelsAndConversations() {
  yield all([
    call(clearChannels),
    put(receive([])),
  ]);
}

export function* fetchChannelsAndConversations() {
  if (String(yield select(channelListStatus)) !== AsyncListStatus.Stopped) {
    yield call(fetchChannels);
  }
}

function* listenForUserLogin() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogin);
    yield call(MatrixAdapter.matrixInitialized);
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
    yield call(clearLastActiveConversation);
    yield call(openFirstConversation);
  }
}

function* clearOnLogout() {
  yield put(setStatus(AsyncListStatus.Idle));
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

  let initialUpdates = [];
  for (const update of batchedUpdates) {
    const mappedChannel: Partial<Channel> = yield call(
      updateChannelWithRoomData,
      update.roomId,
      update.roomData,
      matrixClientInstance.matrix
    );
    // Get all user ids from all channels and fetch them from the store. If they don't exist, fetch them from the API
    if (update.roomData.initial) {
      initialUpdates.push(update.roomId);
    }
    if (mappedChannel) {
      yield fork(receiveChannel, mappedChannel);
    }
  }
  if (initialUpdates.length > 0) {
    for (const roomId of initialUpdates) {
      const room = matrixClientInstance.matrix.getRoom(roomId);
      // User was invited to the room, so we need to auto-join it
      // This could be updated to show Accept/Reject buttons in the UI like mobile does
      if (room.getMyMembership() === MembershipStateType.Invite) {
        yield call(matrixClientInstance.autoJoinRoom, roomId);
        const channels = yield select(rawConversationsList);
        yield put(receive([...channels, roomId]));
      }
    }
    yield fork(loadMembersIfNeeded, initialUpdates);
  }
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
  yield takeEveryFromBus(chatBus, ChatEvents.RoomGroupTypeChanged, roomGroupTypeChangedAction);
  yield takeEveryFromBus(chatBus, ChatEvents.OtherUserJoinedChannel, otherUserJoinedChannelAction);
  yield takeEveryFromBus(chatBus, ChatEvents.OtherUserLeftChannel, otherUserLeftChannelAction);
  yield takeEveryFromBus(chatBus, ChatEvents.RoomData, batchedRoomDataAction);
}

function* userJoinedChannelAction({ payload }) {
  yield addChannel(payload.channelId);

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

export function* addChannel(channelId) {
  const channel = yield select(channelSelector(channelId));
  if (!channel) {
    return;
  }

  const chatClient = yield call(chat.get);
  const newChannelData = yield call([chatClient, chatClient.getNewChannelDataById], channelId);
  yield call(receiveChannel, {
    ...channel,
    ...newChannelData,
  });
  yield call(loadMembersIfNeeded, [channelId]);
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
  if (!channel?.otherMembers?.includes(user.userId)) {
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

  yield call(receiveChannel, {
    id: channel.id,
    otherMembers: channel?.otherMembers?.filter((userId) => userId !== existingUser.userId) || [],
  });
}
