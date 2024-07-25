import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, spawn, take } from 'redux-saga/effects';
import { SagaActionTypes, rawReceive, schema, removeAll, Channel, CHANNEL_DEFAULTS } from '.';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/saga';
import {
  chat,
  sendTypingEvent as matrixSendUserTypingEvent,
  addRoomToMuted,
  removeRoomFromMuted,
  addRoomToLabel,
  removeRoomFromLabel,
} from '../../lib/chat';
import { mostRecentConversation } from '../channels-list/selectors';
import { setActiveConversation } from '../chat/saga';
import { ParentMessage, PowerLevels } from '../../lib/chat/types';
import { rawSetActiveConversationId } from '../chat';
import { resetConversationManagement } from '../group-management/saga';
import { leadingDebounce } from '../utils';
import { ChatMessageEvents, getChatMessageBus } from '../messages/messages';
import { getLocalZeroUsersMap } from '../messages/saga';
import { userByMatrixIdSelector } from '../users/selectors';
import { rawChannel } from './selectors';
import cloneDeep from 'lodash/cloneDeep';

export const rawChannelSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels['${channelId}']`, null);
};

export function* markAllMessagesAsRead(channelId, userId) {
  if (!userId) {
    return;
  }

  const chatClient = yield call(chat.get);
  try {
    yield call([chatClient, chatClient.markRoomAsRead], channelId, userId);
    yield call(receiveChannel, { id: channelId, unreadCount: 0 });
  } catch (error) {}
}

// mark all messages in read in current active conversation
export function* markConversationAsRead(conversationId) {
  const currentUser = yield select(currentUserSelector());
  const conversationInfo = yield select(rawChannelSelector(conversationId));
  if (conversationInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, conversationId, currentUser.id);
  }
}

export function* openFirstConversation() {
  const conversation = yield select(mostRecentConversation);
  if (conversation) {
    yield call(openConversation, conversation.id);
  } else {
    // Not sure this is the right choice. Maybe there's a redirectToRoot at some point.
    yield call(rawSetActiveConversationId, null);
  }
}

export function* openConversation(conversationId) {
  if (!conversationId) {
    return;
  }

  yield call(setActiveConversation, conversationId);
  yield spawn(markConversationAsRead, conversationId);
  yield call(resetConversationManagement);
}

export function* unreadCountUpdated(action) {
  const { channelId, unreadCount } = action.payload;

  const channel = yield select(rawChannelSelector(channelId));

  if (!channel) {
    return;
  }

  yield call(receiveChannel, { id: channelId, unreadCount: unreadCount });
}

export function* onReply(reply: ParentMessage) {
  const activeConversationId = yield select((state) => state.chat.activeConversationId);
  if (!activeConversationId) {
    return;
  }

  yield call(receiveChannel, { id: activeConversationId, reply });
}

export function* onRemoveReply() {
  const activeConversationId = yield select((state) => state.chat.activeConversationId);
  if (!activeConversationId) {
    return;
  }

  yield call(receiveChannel, { id: activeConversationId, reply: null });
}

export function* clearChannels() {
  yield put(removeAll({ schema: schema.key }));
}

export function* receiveChannel(channel: Partial<Channel>) {
  const existing = yield select(rawChannelSelector(channel.id));
  let data = { ...channel };
  if (!existing) {
    data = { ...CHANNEL_DEFAULTS, ...data };
  }

  yield put(rawReceive(data));
}

export function* onMuteRoom(action) {
  const { roomId } = action.payload;
  try {
    yield call(addRoomToMuted, roomId);
  } catch (error) {
    console.error(`Failed to mute room ${roomId}:`, error);
  }
}

export function* onUnmuteRoom(action) {
  const { roomId } = action.payload;
  try {
    yield call(removeRoomFromMuted, roomId);
  } catch (error) {
    console.error(`Failed to unmute room ${roomId}:`, error);
  }
}

export function* roomMuted(action) {
  const { roomId } = action.payload;
  try {
    yield call(receiveChannel, { id: roomId, isMuted: true });
  } catch (error) {
    console.error(`Failed to update mute status for room ${roomId}:`, error);
  }
}

export function* roomUnmuted(action) {
  const { roomId } = action.payload;
  try {
    yield call(receiveChannel, { id: roomId, isMuted: false });
  } catch (error) {
    console.error(`Failed to update unmute status for room ${roomId}:`, error);
  }
}

export function* onAddLabel(action) {
  const { roomId, label } = action.payload;
  try {
    yield call(addRoomToLabel, roomId, label);
  } catch (error) {
    console.error(`Failed to add label ${label} to room ${roomId}:`, error);
  }
}

export function* onRemoveLabel(action) {
  const { roomId, label } = action.payload;
  try {
    yield call(removeRoomFromLabel, roomId, label);
  } catch (error) {
    console.error(`Failed to remove label ${label} from room ${roomId}:`, error);
  }
}

export function* roomLabelChange(action) {
  const { roomId, labels } = action.payload;
  try {
    const channel = yield select(rawChannelSelector(roomId));
    const currentLabels = channel?.labels || [];

    const newLabels = labels.filter((label) => !currentLabels?.includes(label));
    const removedLabels = currentLabels?.filter((label) => !labels.includes(label));

    const updatedLabels = [...currentLabels?.filter((label) => !removedLabels?.includes(label)), ...newLabels];

    yield call(receiveChannel, { id: roomId, labels: updatedLabels });
  } catch (error) {
    console.error(`Failed to update label status for room ${roomId}:`, error);
  }
}

export function* receivedRoomMembersTyping(action) {
  const { roomId, userIds: matrixIds } = action.payload;

  const currentUser = yield select(currentUserSelector());
  const zeroUsersByMatrixIds = yield call(getLocalZeroUsersMap);
  const otherMembersTyping = [];
  for (const matrixId of matrixIds) {
    if (matrixId === currentUser.matrixId) {
      continue;
    }

    const zeroUser = zeroUsersByMatrixIds[matrixId];
    if (zeroUser) {
      otherMembersTyping.push(zeroUser.firstName);
    }
  }

  yield call(receiveChannel, { id: roomId, otherMembersTyping });
}

export function* publishUserTypingEvent(action) {
  const roomId = action.payload.roomId || (yield select((state) => state.chat.activeConversationId));

  try {
    yield call(matrixSendUserTypingEvent, roomId, true);
  } catch (error) {
    console.error(`Failed to publish user is typing event in room ${roomId}:`, error);
  }
}

export function* publishUserStoppedTypingEvent(roomId) {
  try {
    yield call(matrixSendUserTypingEvent, roomId, false);
  } catch (error) {
    console.error(`Failed to publish user stopped typing event in room ${roomId}:`, error);
  }
}

// publishes a user stopped typing event when a message is sent
function* listenForMessageSent() {
  const chatBus = yield call(getChatMessageBus);
  while (true) {
    const { channelId } = yield take(chatBus, ChatMessageEvents.Sent);
    yield call(publishUserStoppedTypingEvent, channelId);
  }
}

export function* receivedRoomMemberPowerLevelChanged(action) {
  const { roomId, matrixId, powerLevel } = action.payload;
  const user = yield select(userByMatrixIdSelector, matrixId);
  const channel = yield select(rawChannel, roomId);
  if (!user || !channel) {
    return;
  }

  let moderatorIds = cloneDeep(channel.moderatorIds || []);

  if (powerLevel === PowerLevels.Moderator) {
    if (!moderatorIds.includes(user.userId)) {
      moderatorIds.push(user.userId);
    }
  }

  if (powerLevel === PowerLevels.Viewer) {
    const index = moderatorIds.indexOf(user.userId);
    if (index !== -1) {
      moderatorIds.splice(index, 1);
    }
  }

  yield call(receiveChannel, { id: roomId, moderatorIds });
}

export function* saga() {
  yield spawn(listenForMessageSent);
  yield leadingDebounce(4000, SagaActionTypes.UserTypingInRoom, publishUserTypingEvent);

  yield takeLatest(SagaActionTypes.OpenConversation, ({ payload }: any) => openConversation(payload.conversationId));
  yield takeLatest(SagaActionTypes.OnReply, ({ payload }: any) => onReply(payload.reply));
  yield takeLatest(SagaActionTypes.OnRemoveReply, onRemoveReply);
  yield takeLatest(SagaActionTypes.OnMuteRoom, onMuteRoom);
  yield takeLatest(SagaActionTypes.OnUnmuteRoom, onUnmuteRoom);
  yield takeLatest(SagaActionTypes.OnAddLabel, onAddLabel);
  yield takeLatest(SagaActionTypes.OnRemoveLabel, onRemoveLabel);

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.UnreadCountChanged, unreadCountUpdated);
  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.RoomMuted, roomMuted);
  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.RoomUnmuted, roomUnmuted);
  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.RoomMemberTyping, receivedRoomMembersTyping);
  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.RoomLabelChange, roomLabelChange);
  yield takeEveryFromBus(
    yield call(getChatBus),
    ChatEvents.RoomMemberPowerLevelChanged,
    receivedRoomMemberPowerLevelChanged
  );
}
