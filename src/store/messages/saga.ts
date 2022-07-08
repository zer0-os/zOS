import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { receive } from '../channels';

import { api } from './api';

export function* fetch(action) {
  const channelId = action.payload;

  const messages = yield call(api.fetch, channelId);

  yield put(receive({ id: channelId, messages }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
