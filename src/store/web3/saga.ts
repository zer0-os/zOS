import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setConnectionStatus, setConnector } from '.';
import { dispatch } from '../../app-sandbox/store';
import { setConnectionStatus as appSandboxSetConnectionStatus } from '../../app-sandbox/store/web3';

import { ConnectionStatus } from '../../lib/web3';

export function* updateConnector(action) {
  yield put(setConnector(action.payload));
  yield put(setConnectionStatus(ConnectionStatus.Connecting));

  // do we want to encapsulate this better, or does it make
  // sense for this to need to dispatch?
  yield call(dispatch, appSandboxSetConnectionStatus(ConnectionStatus.Connecting));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateConnector, updateConnector);
}
