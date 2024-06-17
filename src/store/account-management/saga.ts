import { call, put, takeLeading } from 'redux-saga/effects';

import { Errors, SagaActionTypes, setErrors, setWalletSelectModalStatus } from '.';

export function* linkNewWalletToZEROAccount(action) {
  const { connector } = action.payload;
  console.log('Connector: ', connector);

  try {
    yield call(closeWalletSelectModal);
  } catch (e) {
    yield put(setErrors([Errors.UNKNOWN_ERROR]));
  } finally {
  }
}

export function* openWalletSelectModal() {
  yield put(setWalletSelectModalStatus(true));
}

export function* closeWalletSelectModal() {
  yield put(setWalletSelectModalStatus(false));
}

export function* saga() {
  yield takeLeading(SagaActionTypes.AddNewWallet, linkNewWalletToZEROAccount);
  yield takeLeading(SagaActionTypes.OpenWalletSelectModal, openWalletSelectModal);
  yield takeLeading(SagaActionTypes.CloseWalletSelectModal, closeWalletSelectModal);
}
