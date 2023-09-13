import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, spawn } from 'redux-saga/effects';
import { SagaActionTypes, receive, schema, removeAll } from '.';

import { joinChannel as joinChannelAPI, markAllMessagesAsReadInChannel as markAllMessagesAsReadAPI } from './api';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/saga';
import { fetch as fetchMessages } from '../messages/saga';
import { setActiveChannelId, setactiveConversationId } from '../chat';

export const rawChannelSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels['${channelId}']`, null);
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
  if (!userId) {
    return;
  }

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
export function* markChannelAsRead(channelId) {
  const currentUser = yield select(currentUserSelector());
  const isMessengerFullScreen = yield select((state) => state.layout.value.isMessengerFullScreen);
  const activeChannelInfo = yield select(rawChannelSelector(channelId));

  // just ensure first that you're not in full screen mode before marking all messages as read in a "channel"
  if (!isMessengerFullScreen && activeChannelInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, channelId, currentUser.id);
  }
}

// mark all messages in read in current active conversation
export function* markConversationAsRead(conversationId) {
  const currentUser = yield select(currentUserSelector());
  const activeConversationInfo = yield select(rawChannelSelector(conversationId));
  if (activeConversationInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, conversationId, currentUser.id);
  }
}

export function* openChannel(action) {
  const { channelId } = action.payload;
  if (!channelId) {
    return;
  }

  yield put(setActiveChannelId(channelId));
  yield call(markChannelAsRead, channelId);
}

export function* openConversation(action) {
  const { conversationId } = action.payload;
  if (!conversationId) {
    return;
  }

  yield put(setactiveConversationId(conversationId));
  yield call(markConversationAsRead, conversationId);
}

export function* unreadCountUpdated(action) {
  const { channelId, unreadCount } = action.payload;

  const channel = yield select(rawChannelSelector(channelId));

  if (!channel) {
    return;
  }

  yield put(
    receive({
      id: channelId,
      unreadCount: unreadCount,
    })
  );

  if (!channel.hasLoadedMessages && unreadCount > 0) {
    yield spawn(fetchMessages, { payload: { channelId } });
  }
}

export function* clearChannels() {
  yield put(removeAll({ schema: schema.key }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);
  yield takeLatest(SagaActionTypes.OpenChannel, openChannel);
  yield takeLatest(SagaActionTypes.OpenConversation, openConversation);

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.UnreadCountChanged, unreadCountUpdated);
}
