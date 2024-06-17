import { call, put, takeLeading } from 'redux-saga/effects';

import { Errors, SagaActionTypes, setAddEmailAccountModalStatus, setErrors, setWalletSelectModalStatus } from '.';

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

export function addEmailToZEROAccount(action) {
  const { email, password } = action.payload;
  console.log('in saga addEmailToZEROAccount', email, password);
}

export function* openWalletSelectModal() {
  yield put(setWalletSelectModalStatus(true));
}

export function* closeWalletSelectModal() {
  yield put(setWalletSelectModalStatus(false));
}

export function* openAddEmailAccountModal() {
  yield put(setAddEmailAccountModalStatus(true));
}

export function* closeAddEmailAccountModal() {
  yield put(setAddEmailAccountModalStatus(false));
}

export function* saga() {
  yield takeLeading(SagaActionTypes.AddNewWallet, linkNewWalletToZEROAccount);
  yield takeLeading(SagaActionTypes.AddEmailAccount, addEmailToZEROAccount);

  yield takeLeading(SagaActionTypes.OpenWalletSelectModal, openWalletSelectModal);
  yield takeLeading(SagaActionTypes.CloseWalletSelectModal, closeWalletSelectModal);
  yield takeLeading(SagaActionTypes.OpenAddEmailAccountModal, openAddEmailAccountModal);
  yield takeLeading(SagaActionTypes.CloseAddEmailAccountModal, closeAddEmailAccountModal);
}
