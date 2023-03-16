import { takeLatest, put } from 'redux-saga/effects';
import { SagaActionTypes, setReconnecting } from '.';

export function* receiveIsReconnecting(action) {
  yield put(setReconnecting(action.payload));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.ReceiveIsReconnecting, receiveIsReconnecting);
}
