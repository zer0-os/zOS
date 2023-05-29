import { takeLatest, put, takeEvery, call } from 'redux-saga/effects';
import { SagaActionTypes, setConnectionStatus, setConnector, setWalletAddress } from '.';

import { ConnectionStatus } from '../../lib/web3';
import { web3Channel } from './channels';

export function* updateConnector(action) {
  console.log('updating connector', action.payload);
  yield put(setConnector(action.payload));
  yield put(setConnectionStatus(ConnectionStatus.Connecting));
}

export function* setAddress(action) {
  console.log('setting address?', action);
  yield put(setWalletAddress(action.payload));
  // Publish a system message across the channel
  const channel = yield call(web3Channel);
  console.log('publishing!!', action.payload);
  yield put(channel, { type: 'ADDRESS_CHANGED', payload: action.payload });
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateConnector, updateConnector);
  // XXX: Temporary? Does this happen more organically based on other events?
  yield takeEvery(SagaActionTypes.SetAddress, setAddress);
}
