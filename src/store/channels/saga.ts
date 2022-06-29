import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, setStatus, ConnectionStatus } from '.';

export function* connect(_action) {
  yield put(setStatus(ConnectionStatus.Connecting));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Connect, connect);
}
