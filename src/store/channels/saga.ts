import getDeepProperty from 'lodash.get';
import { takeLatest, put, call, select } from 'redux-saga/effects';
import { SagaActionTypes, receive, schema, remove } from '.';

import {
  fetchUsersByChannelId,
  joinChannel as joinChannelAPI,
  markAllMessagesAsReadInChannel as markAllMessagesAsReadAPI,
} from './api';

const rawChannelSelector = (channelId) => (state) => {
  return getDeepProperty(state, `normalized.channels[${channelId}]`, null);
};

export function* loadUsers(action) {
  const { channelId } = action.payload;

  const users = yield call(fetchUsersByChannelId, channelId);

  if (users) {
    const formatUsers = users.map(({ userId: id, ...rest }) => ({
      id,
      ...rest,
    }));

    yield put(
      receive({
        id: channelId,
        users: formatUsers,
      })
    );
  }
}

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

export function* clearChannel(id) {
  yield put(remove({ schema: schema.key, id }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.LoadUsers, loadUsers);
  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);
  yield takeLatest(SagaActionTypes.MarkAllMessagesAsReadInChannel, markAllMessagesAsReadInChannel);
  yield takeLatest(SagaActionTypes.UnreadCountUpdated, unreadCountUpdated);
}
