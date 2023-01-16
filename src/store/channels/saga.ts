import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, receive } from '.';

import {
  fetchUsersByChannelId,
  joinChannel as joinChannelAPI,
  markAllMessagesAsReadInChannel as markAllMessagesAsReadAPI,
} from './api';

export interface Payload {
  channelId: string;
}

export interface MarkAsReadPayload {
  channelId: string;
  userId: string;
}

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

export function* saga() {
  yield takeLatest(SagaActionTypes.LoadUsers, loadUsers);
  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);
  yield takeLatest(SagaActionTypes.markAllMessagesAsReadInChannel, markAllMessagesAsReadInChannel);
}
