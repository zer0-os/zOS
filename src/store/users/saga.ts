import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setUsers } from '.';

import { searchMyNetworks } from './api';

export interface FetchUsersPayload {
  search: string;
  networkIds?: string[];
  feedItemId?: string;
}

export function* fetch(action) {
  const { search } = action.payload;
  const users = yield call(searchMyNetworks, search);

  yield put(setUsers(users));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
