import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, setConnectionStatus, setConnector } from '.';

import { ConnectionStatus } from '../../lib/web3';

export function* updateConnector(action) {
  yield put(setConnector(action.payload));
  yield put(setConnectionStatus(ConnectionStatus.Connecting));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateConnector, updateConnector);
}
