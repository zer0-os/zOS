import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, take, spawn } from 'redux-saga/effects';
import { SagaActionTypes, receive, schema, removeAll } from '.';

import { joinChannel as joinChannelAPI, markAllMessagesAsReadInChannel as markAllMessagesAsReadAPI } from './api';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { ChannelEvents, conversationsChannel } from '../channels-list/channels';

export const rawChannelSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}]`, null);
};

export function* joinChannel(action) {
  const { channelId } = action.payload;

  yield call(joinChannelAPI, channelId);

  yield put(
    receive({
      id: channelId,
      hasJoined: true,
    })
  );
}

export function* markAllMessagesAsRead(channelId, userId) {
  if (!channelId || !userId) {
    return;
  } // in case of an admin message userId can be undefined

  const status = yield call(markAllMessagesAsReadAPI, channelId, userId);

  if (status === 200) {
    yield put(
      receive({
        id: channelId,
        unreadCount: 0,
      })
    );
  }
}

// mark all messages as read in current active channel (only if you're not in full screen mode)
function* markAllMessagesAsReadInCurrentChannel(userId) {
  const isMessengerFullScreen = yield select((state) => state.layout.value.isMessengerFullScreen);
  const activeChannelId = yield select((state) => state.chat.activeChannelId);
  const activeChannelInfo = activeChannelId ? yield select(rawChannelSelector(activeChannelId)) : null;

  // just ensure first that you're not in full screen mode before marking all messages as read in a "channel"
  if (!isMessengerFullScreen && activeChannelId && activeChannelInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, activeChannelId, userId);
  }
}

// mark all messages in read in current active conversation
function* markAllMessagesAsReadInCurrentConversation(userId) {
  const activeConversationId = yield select((state) => state.chat.activeConversationId);
  const activeConversationInfo = activeConversationId ? yield select(rawChannelSelector(activeConversationId)) : null;

  if (activeConversationId && activeConversationInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, activeConversationId, userId);
  }
}

export function* markAllAsRead() {
  const userId = yield select((state) => state.authentication.user.data.id);
  yield call(markAllMessagesAsReadInCurrentChannel, userId);
  yield call(markAllMessagesAsReadInCurrentConversation, userId);
}

export function* unreadCountUpdated(action) {
  const { channelId, unreadCount } = action.payload;

  const channel = yield select(rawChannelSelector(channelId));

  if (!channel || channel.unreadCount === unreadCount) {
    return;
  }

  yield put(
    receive({
      id: channelId,
      unreadCount: unreadCount,
    })
  );
}

export function* clearChannels() {
  yield put(removeAll({ schema: schema.key }));
}

function* listenForChannelLoadedEvent() {
  const channel = yield call(conversationsChannel);
  while (true) {
    const { channelId = undefined } = yield take(channel, ChannelEvents.MessagesLoadedForChannel);
    if (channelId) {
      yield call(markAllAsRead);
    }
  }
}

export function* saga() {
  yield spawn(listenForChannelLoadedEvent);
  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.UnreadCountChanged, unreadCountUpdated);
}
