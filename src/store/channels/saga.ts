import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaActionTypes, receive, schema, removeAll } from '.';

import { joinChannel as joinChannelAPI, markAllMessagesAsReadInChannel as markAllMessagesAsReadAPI } from './api';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { ChannelEvents, conversationsChannel } from '../channels-list/channels';
import { currentUserSelector } from '../authentication/saga';

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
export function* markAllMessagesAsReadInCurrentChannel() {
  const currentUser = yield select(currentUserSelector());
  const isMessengerFullScreen = yield select((state) => state.layout.value.isMessengerFullScreen);
  const activeChannelId = yield select((state) => state.chat.activeChannelId);
  const activeChannelInfo = activeChannelId ? yield select(rawChannelSelector(activeChannelId)) : null;

  // just ensure first that you're not in full screen mode before marking all messages as read in a "channel"
  if (!isMessengerFullScreen && activeChannelId && activeChannelInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, activeChannelId, currentUser.id);
  }
}

// mark all messages in read in current active conversation
export function* markAllMessagesAsReadInCurrentConversation() {
  const currentUser = yield select(currentUserSelector());
  const activeConversationId = yield select((state) => state.chat.activeConversationId);
  const activeConversationInfo = activeConversationId ? yield select(rawChannelSelector(activeConversationId)) : null;

  if (activeConversationId && activeConversationInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, activeConversationId, currentUser.id);
  }
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

export function* saga() {
  yield takeEveryFromBus(
    yield call(conversationsChannel),
    ChannelEvents.MessagesLoadedForChannel,
    markAllMessagesAsReadInCurrentChannel
  );
  yield takeEveryFromBus(
    yield call(conversationsChannel),
    ChannelEvents.MessagesLoadedForConversation,
    markAllMessagesAsReadInCurrentConversation
  );

  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.UnreadCountChanged, unreadCountUpdated);
}
