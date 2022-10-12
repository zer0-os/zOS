import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { channelIdPrefix } from '../channels-list/saga';
import { receive } from '../channels';

import { fetchUsersByChannelId } from './api';

export interface Payload {
  channelId: string;
}

export function* fetch(action) {
  const { channelId } = action.payload;
  const channelPrefix: string = channelIdPrefix + channelId;

  const users = yield call(fetchUsersByChannelId, channelPrefix);
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

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
