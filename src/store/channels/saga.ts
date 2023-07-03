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

/**
 * Marks all messages as "read" in a channel for a specific user (queries zero-api & sendbird).
 */
export function* markAllMessagesAsReadInChannel(action) {
  const { channelId, userId } = action.payload;

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
    const loadedChannel = yield select(rawChannelSelector(channelId));
    if (loadedChannel && loadedChannel.unreadCount > 0) {
      yield call(markAllMessagesAsReadInChannel, { payload: { channelId, userId: loadedChannel.userId } });
    }
  }
}

export function* saga() {
  yield spawn(listenForChannelLoadedEvent);
  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);

  yield takeEveryFromBus(yield call(getChatBus), ChatEvents.UnreadCountChanged, unreadCountUpdated);
}
