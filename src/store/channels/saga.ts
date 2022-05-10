import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, receive, setStatus, ConnectionStatus } from '.';

import { client } from '../../lib/channels';

export function* connect(action) {
  const account = action.payload;

  yield put(setStatus(ConnectionStatus.Connecting));

  const channelsClient = yield call(client.get);

  yield call([channelsClient, channelsClient.connect], account);
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Connect, connect);
}
