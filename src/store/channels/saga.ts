import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, receive } from '.';

import { fetchUsersByChannelId, joinChannel as joinChannelAPI } from './api';

export interface Payload {
  channelId: string;
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

export function* saga() {
  yield takeLatest(SagaActionTypes.LoadUsers, loadUsers);
  yield takeLatest(SagaActionTypes.JoinChannel, joinChannel);
}
