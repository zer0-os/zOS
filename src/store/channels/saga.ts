import { takeLatest, put, call } from 'redux-saga/effects';
import { Sender } from 'sendbird';
import { SagaActionTypes, receive } from '.';
import { User } from '.';

import { fetchUsersByChannelId, joinChannel as joinChannelAPI } from './api';

export interface Payload {
  channelId: string;
}

export const channelIdPrefix = 'sendbird_group_channel_';

export function* loadUsers(action) {
  const { channelId } = action.payload;
  const channelPrefix: string = channelIdPrefix + channelId;

  const users = yield call(fetchUsersByChannelId, channelPrefix);

  yield put(
    receive({
      id: channelId,
      users: formatUsers(users),
    })
  );
}

export function* joinChannel(action) {
  const { channelId } = action.payload;
  const channelPrefix: string = channelIdPrefix + channelId;

  yield call(joinChannelAPI, channelId);
  const users = yield call(fetchUsersByChannelId, channelPrefix);

  yield put(
    receive({
      id: channelId,
      users: formatUsers(users),
    })
  );
}

function formatUsers(users): User[] {
  return users.map(({ userId: id, ...rest }) => ({
    id,
    ...rest,
  }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.LoadUsers, loadUsers);
  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);
}
