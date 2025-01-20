import { v4 as uuidv4 } from 'uuid';
import getDeepProperty from 'lodash.get';
import uniqBy from 'lodash.uniqby';
import { fork, put, call, take, all, select, spawn } from 'redux-saga/effects';
import { receive, denormalizeConversations, setStatus } from '.';
import { batchDownloadFiles, chat, downloadFile, getRoomTags } from '../../lib/chat';

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
import { uniqNormalizedList } from '../utils';
import { channelListStatus, rawConversationsList } from './selectors';
import { setIsConversationsLoaded, setIsSecondaryConversationDataLoaded } from '../chat';
import { getUserReadReceiptPreference } from '../user-profile/saga';
import { featureFlags } from '../../lib/feature-flags';
import { createUnencryptedConversation as createUnencryptedMatrixConversation } from '../../lib/chat';
import { isFileUploadedToMatrix } from '../../lib/chat/matrix/media';
import { clearLastActiveConversation } from '../../lib/last-conversation';

export function* parseProfileImagesForMembers(channels: any[]) {
  // Create a map of users that need profile image downloads
  const profileImageUrlsMap: { [url: string]: string } = {};

  for (const channel of channels) {
    [...(channel.memberHistory || []), ...(channel.otherMembers || [])].forEach((member) => {
      if (isFileUploadedToMatrix(member.profileImage)) {
        profileImageUrlsMap[member.profileImage] = member.matrixId;
      }
    });
  }

  // Download all profile images in parallel (in batches of 20)
  const profileImageUrls = Object.keys(profileImageUrlsMap);
  if (profileImageUrls.length === 0) {
    return;
  }

  const downloadedProfileImages = yield call(batchDownloadFiles, profileImageUrls, true);

  // Helper function to update profile images
  const updateMemberProfileImage = (member) => {
    if (downloadedProfileImages[member.profileImage]) {
      member.profileImage = downloadedProfileImages[member.profileImage];
    }
  };

  // Update all members in channels with the downloaded profile images
  for (const channel of channels) {
    [...(channel.memberHistory || []), ...(channel.otherMembers || [])].forEach(updateMemberProfileImage);
  }
}

export function* mapConversationIcons(channels: any[]) {
  // Filter channels to find those with icons that need to be downloaded
  const channelIcons = channels
    .filter((channel) => isFileUploadedToMatrix(channel.icon))
    .map((channel) => channel.icon);

  if (channelIcons.length === 0) {
    return;
  }

  // Download all channel icons in parallel (in batches of 20)
  const downloadedChannelIcons = yield call(batchDownloadFiles, channelIcons, true);

  // Update channels with the downloaded icons
  channels.forEach((channel) => {
    if (downloadedChannelIcons[channel.icon]) {
      channel.icon = downloadedChannelIcons[channel.icon];
    }
  });
}

export function* mapToZeroUsers(channels: any[]) {
  let allMatrixIds = [],
    matrixUsersMap = {};

  for (const channel of channels) {
    channel.memberHistory.forEach((member) => {
      matrixUsersMap[member.matrixId] = member;
    });

    // Use the spread operator and Set to remove duplicates and improve union performance
    allMatrixIds = [...new Set([...allMatrixIds, ...channel.memberHistory.map((u) => u.matrixId)])];
  }

  const zeroUsers = yield call(getZEROUsers, allMatrixIds);
  const zeroUsersMap = {};
  for (const user of zeroUsers) {
    user.profileImage = matrixUsersMap[user.matrixId]?.profileImage || user.profileImage;
    zeroUsersMap[user.matrixId] = user;
  }

  yield call(mapChannelMembers, channels, zeroUsersMap);
  yield call(mapChannelMessages, channels, zeroUsersMap);
  return;
}

export function* fetchRoomName(roomId) {
  const chatClient = yield call(chat.get);
  const roomName = yield call([chatClient, chatClient.getRoomNameById], roomId);
  yield call(roomNameChanged, roomId, roomName);
}

export function* fetchRoomAvatar(roomId) {
  const chatClient = yield call(chat.get);
  const roomAvatar = yield call([chatClient, chatClient.getRoomAvatarById], roomId);
  yield call(roomAvatarChanged, roomId, roomAvatar);
}

export function* fetchRoomGroupType(roomId) {
  const chatClient = yield call(chat.get);
  const roomGroupType = yield call([chatClient, chatClient.getRoomGroupTypeById], roomId);
  yield call(roomGroupTypeChanged, roomId, roomGroupType);
}

export function* fetchConversations() {
  featureFlags.enableTimerLogs && console.time('xxxfetchConversations');

  yield put(setStatus(AsyncListStatus.Fetching));
  const chatClient = yield call(chat.get);
  const conversations = yield call([
    chatClient,
    chatClient.getConversations,
  ]);

  featureFlags.enableTimerLogs && console.time('xxxmapToZeroUsers');
  yield call(mapToZeroUsers, conversations);
  yield call(mapConversationIcons, conversations);
  featureFlags.enableTimerLogs && console.timeEnd('xxxmapToZeroUsers');

  yield call(getUserReadReceiptPreference);

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

  yield put(setIsConversationsLoaded(true));

  const channel = yield call(getConversationsBus);
  yield put(channel, { type: ConversationEvents.ConversationsLoaded });

  featureFlags.enableTimerLogs && console.timeEnd('xxxfetchConversations');

  featureFlags.enableTimerLogs && console.time('xxxloadSecondaryConversationData');
  const combinedConversations = [...optimisticConversationIds, ...conversations];
  yield fork(loadSecondaryConversationData, combinedConversations);
  featureFlags.enableTimerLogs && console.timeEnd('xxxloadSecondaryConversationData');
}

export function* loadSecondaryConversationData(conversations) {
  yield put(setIsSecondaryConversationDataLoaded(false));
  yield call(getRoomTags, conversations);
  yield call(parseProfileImagesForMembers, conversations);

  const receiveCalls = conversations.map((conversation) =>
    call(receiveChannel, {
      id: conversation.id,
      labels: conversation.labels,
      otherMembers: conversation.otherMembers,
      memberHistory: conversation.memberHistory,
    })
  );
  yield all(receiveCalls);

  yield put(setIsSecondaryConversationDataLoaded(true));
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

export function* createUnencryptedConversation(
  userIds: string[],
  name: string = null,
  image: File = null,
  groupType?: string
) {
  const chatClient = yield call(chat.get);

  let optimisticChannel = { id: '', optimisticId: '' };
  if (yield call(chatClient.supportsOptimisticCreateConversation)) {
    optimisticChannel = yield call(createOptimisticConversation, userIds, name, image);
    yield call(openConversation, optimisticChannel.id);
  }

  try {
    const users = yield select(userSelector, userIds);
    const channel = yield call(
      createUnencryptedMatrixConversation,
      users,
      name,
      image,
      optimisticChannel.id,
      groupType
    );
    yield call(receiveCreatedConversation, channel, optimisticChannel);
    return channel;
  } catch {
    yield call(handleCreateConversationError, optimisticChannel);
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
    unreadCount: { total: 0, highlight: 0 },
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

  yield call(parseProfileImagesForMembers, [conversation]);

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
    yield call(clearLastActiveConversation);
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
  yield takeEveryFromBus(chatBus, ChatEvents.RoomGroupTypeChanged, roomGroupTypeChangedAction);
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

function* roomGroupTypeChangedAction(action) {
  yield roomGroupTypeChanged(action.payload.id, action.payload.groupType);
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
  yield call(parseProfileImagesForMembers, [channel]);
  yield fork(fetchRoomName, channel.id);
  yield fork(fetchRoomAvatar, channel.id);
  yield fork(fetchRoomGroupType, channel.id);

  yield put(receive(uniqNormalizedList([...conversationsList, channel])));
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

export function* otherUserJoinedChannel(roomId: string, user: User) {
  const channel = yield select(rawChannel, roomId);
  if (!channel) {
    return;
  }

  if (user.userId === user.matrixId) {
    user = yield call(getUserByMatrixId, user.matrixId) || user;
    const profileImage = yield call(downloadFile, user.profileImage || '');
    user = { ...user, profileImage };
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
