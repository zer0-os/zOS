import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaActionTypes, receive, schema, removeAll } from '.';

import { joinChannel as joinChannelAPI, markAllMessagesAsReadInChannel as markAllMessagesAsReadAPI } from './api';

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

export function* saga() {
  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);
  yield takeLatest(SagaActionTypes.MarkAllMessagesAsReadInChannel, markAllMessagesAsReadInChannel);
  yield takeLatest(SagaActionTypes.UnreadCountUpdated, unreadCountUpdated);
}
