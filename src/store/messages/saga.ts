import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes } from '.';
import { receive } from '../channels';

import { fetchMessagesByChannelId } from './api';

export function* fetch(action) {
  const channelId = action.payload;

  const messages = yield call(fetchMessagesByChannelId, channelId);

  yield put(receive({ id: channelId, messages }));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, fetch);
}
