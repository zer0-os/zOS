import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, receiveConnectionStatus, setConnector, setConnectionStatus as setConnectionStatusSaga } from '.';
import { dispatch } from '../../app-sandbox/store';
import { setConnectionStatus as appSandboxSetConnectionStatus } from '../../app-sandbox/store/web3';

import { ConnectionStatus } from '../../lib/web3';

export function* updateConnector(action) {
  yield put(setConnector(action.payload));

  // just call for now. i'm not sure there's a reason to go back
  // through store for this.
  yield setConnectionStatus({ payload: ConnectionStatus.Connecting });
}

export function* setConnectionStatus(action) {
  const status = action.payload;

  yield put(receiveConnectionStatus(status));

  // do we want to encapsulate this better, or does it make
  // sense for this to need to dispatch?
  yield call(dispatch, appSandboxSetConnectionStatus(status));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateConnector, updateConnector);
  yield takeLatest(SagaActionTypes.SetConnectionStatus, setConnectionStatus);
}
