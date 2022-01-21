import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, receiveConnectionStatus, setConnector } from '.';

import { ConnectionStatus } from '../../lib/web3';

export function* updateConnector(action) {
  yield put(setConnector(action.payload));

  // just call for now. i'm not sure there's a reason to go back
  // through store for this.
  yield setConnectionStatus({ payload: ConnectionStatus.Connecting });
}

export function* setConnectionStatus(action) {
  yield put(receiveConnectionStatus(action.payload));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateConnector, updateConnector);
  yield takeLatest(SagaActionTypes.SetConnectionStatus, setConnectionStatus);
}
