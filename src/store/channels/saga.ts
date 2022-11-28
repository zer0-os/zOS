import { takeLatest, put, call } from 'redux-saga/effects';
import getDeepProperty from 'lodash.get';
import { SagaActionTypes, receive } from '.';
import { select } from 'redux-saga-test-plan/matchers';
import { User } from '.';
import { fetch as fetchChannels } from '../channels-list/saga';

import { fetchUsersByChannelId, joinChannel as joinChannelAPI } from './api';

export interface Payload {
  channelId: string;
}

const rawAsyncRootDomainId = () => (state) => getDeepProperty(state, 'zns.value.rootDomainId', '');
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
  const domainId = yield select(rawAsyncRootDomainId());

  yield call(joinChannelAPI, channelId);
  yield call(fetchChannels, { payload: domainId });
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
