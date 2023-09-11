import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select, spawn } from 'redux-saga/effects';
import { SagaActionTypes, receive, schema, removeAll } from '.';

import { joinChannel as joinChannelAPI, markAllMessagesAsReadInChannel as markAllMessagesAsReadAPI } from './api';
import { takeEveryFromBus } from '../../lib/saga';
import { Events as ChatEvents, getChatBus } from '../chat/bus';
import { currentUserSelector } from '../authentication/saga';
import { fetch as fetchMessages } from '../messages/saga';
import { activeChannelIdSelector } from '../chat/selectors';

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
export function* markChannelAsReadIfActive(action) {
  const { channelId } = action.payload;

  const activeChannelId = yield select(activeChannelIdSelector);
  if (channelId !== activeChannelId) {
    return;
  }

  const currentUser = yield select(currentUserSelector());
  const isMessengerFullScreen = yield select((state) => state.layout.value.isMessengerFullScreen);
  const activeChannelInfo = activeChannelId ? yield select(rawChannelSelector(activeChannelId)) : null;

  // just ensure first that you're not in full screen mode before marking all messages as read in a "channel"
  if (!isMessengerFullScreen && activeChannelId && activeChannelInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, activeChannelId, currentUser.id);
  }
}

// mark all messages in read in current active conversation
export function* markConversationAsReadIfActive(action) {
  const { channelId } = action.payload;

  const activeConversationId = yield select((state) => state.chat.activeConversationId);
  if (channelId !== activeConversationId) {
    return;
  }

  const currentUser = yield select(currentUserSelector());
  const activeConversationInfo = activeConversationId ? yield select(rawChannelSelector(activeConversationId)) : null;

  if (activeConversationId && activeConversationInfo?.unreadCount > 0) {
    yield call(markAllMessagesAsRead, activeConversationId, currentUser.id);
  }
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
  yield takeLatest(SagaActionTypes.MarkAllMessagesAsReadInChannel, markChannelAsReadIfActive);
  yield takeLatest(SagaActionTypes.MarkAllMessagesAsReadInConversation, markConversationAsReadIfActive);

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.UnreadCountChanged, unreadCountUpdated);
}
