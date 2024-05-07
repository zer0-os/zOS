import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, spawn, delay, takeLeading, race, take } from 'redux-saga/effects';
import { SagaActionTypes, rawReceive, schema, removeAll, Channel, CHANNEL_DEFAULTS } from '.';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/saga';
import {
  addRoomToFavorites,
  removeRoomFromFavorites,
  chat,
  sendTypingEvent as matrixSendUserTypingEvent,
} from '../../lib/chat';
import { mostRecentConversation } from '../channels-list/selectors';
import { setActiveConversation } from '../chat/saga';
import { ParentMessage } from '../../lib/chat/types';
import { rawSetActiveConversationId } from '../chat';
import { resetConversationManagement } from '../group-management/saga';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { ChatMessageEvents, getChatMessageBus } from '../messages/messages';

export const USER_TYPING_TIMEOUT = 5000; // 5s

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

export function* onFavoriteRoom(action) {
  const { roomId } = action.payload;
  try {
    yield call(addRoomToFavorites, roomId);
  } catch (error) {
    console.error(`Failed to add room ${roomId} to favorites:`, error);
  }
}

export function* onUnfavoriteRoom(action) {
  const { roomId } = action.payload;
  try {
    yield call(removeRoomFromFavorites, roomId);
  } catch (error) {
    console.error(`Failed to remove room ${roomId} from favorites:`, error);
  }
}

export function* roomFavorited(action) {
  const { roomId } = action.payload;
  try {
    yield call(receiveChannel, { id: roomId, isFavorite: true });
  } catch (error) {
    console.error(`Failed to update favorite status for room ${roomId}:`, error);
  }
}

export function* roomUnfavorited(action) {
  const { roomId } = action.payload;
  try {
    yield call(receiveChannel, { id: roomId, isFavorite: false });
  } catch (error) {
    console.error(`Failed to update unfavorite status for room ${roomId}:`, error);
  }
}

export function* publishUserTypingEvent(roomId) {
  try {
    const channel = yield select(rawChannelSelector(roomId));
    if (!channel) {
      return;
    }

    const currentUserLastTypingEventPublishedAt = channel.currentUserLastTypingEventPublishedAt;
    const now = Date.now();
    if (currentUserLastTypingEventPublishedAt && now - currentUserLastTypingEventPublishedAt <= USER_TYPING_TIMEOUT) {
      // not enough time has passed since last typing event
      return;
    }

    yield call(matrixSendUserTypingEvent, roomId, true);
    yield call(receiveChannel, { id: roomId, currentUserLastTypingEventPublishedAt: now });
  } catch (error) {
    console.error(`Failed to publish user is typing event in room ${roomId}:`, error);
  }
}

export function* publishUserStoppedTypingEvent(roomId) {
  try {
    yield call(matrixSendUserTypingEvent, roomId, false);
    yield call(receiveChannel, { id: roomId, currentUserLastTypingEventPublishedAt: null });
  } catch (error) {
    console.error(`Failed to publish user stopped typing event in room ${roomId}:`, error);
  }
}

export function* onUserTypingInRoom(action) {
  const { roomId } = action.payload;

  yield call(publishUserTypingEvent, roomId);

  // Start a race between the next typing event, timeout, room change, user logout, and message sending
  const { nextAction, timeout, roomChanged, onLogout, messageSent } = yield race({
    nextAction: take(SagaActionTypes.UserTypingInRoom),
    timeout: delay(USER_TYPING_TIMEOUT),
    roomChanged: take(SagaActionTypes.OpenConversation),
    onLogout: take(yield call(getAuthChannel), AuthEvents.UserLogout),
    messageSent: take(yield call(getChatMessageBus), ChatMessageEvents.Sent),
  });

  // Check if the timeout occurred or other events happened
  if (timeout || roomChanged || onLogout || messageSent) {
    yield call(publishUserStoppedTypingEvent, roomId);
    return;
  }

  // Recursively call the saga to process the next typing event
  yield call(onUserTypingInRoom, nextAction);
}

export function* saga() {
  yield takeLeading(SagaActionTypes.UserTypingInRoom, onUserTypingInRoom);

  yield takeLatest(SagaActionTypes.OpenConversation, ({ payload }: any) => openConversation(payload.conversationId));
  yield takeLatest(SagaActionTypes.OnReply, ({ payload }: any) => onReply(payload.reply));
  yield takeLatest(SagaActionTypes.OnRemoveReply, onRemoveReply);
  yield takeLatest(SagaActionTypes.OnFavoriteRoom, onFavoriteRoom);
  yield takeLatest(SagaActionTypes.OnUnfavoriteRoom, onUnfavoriteRoom);

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.UnreadCountChanged, unreadCountUpdated);
  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.RoomFavorited, roomFavorited);
  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.RoomUnfavorited, roomUnfavorited);
}
