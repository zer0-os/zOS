import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setUsers } from '.';
import { channelIdPrefix } from '../channels-list/saga';

import { searchMyNetworks } from './api';

export interface Payload {
  channelId: string;
}

export function* fetch(action) {
  const { channelId } = action.payload;
  const channelPrefix: string = channelIdPrefix + channelId;

  const users = yield call(searchMyNetworks, channelPrefix);

  yield put(setUsers(users));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
