import { call, put, select, spawn, take, takeLeading } from 'redux-saga/effects';

import {
  Errors,
  SagaActionTypes,
  setAddEmailAccountModalStatus,
  setErrors,
  setSuccessMessage,
  setWalletSelectModalStatus,
} from '.';

import { addEmailAccount } from '../registration/saga';
import { currentUserSelector } from '../authentication/saga';
import { setUser } from '../authentication';
import cloneDeep from 'lodash/cloneDeep';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';

export function* reset() {
  yield put(setErrors([]));
  yield put(setSuccessMessage(''));
}

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

export function* updateCurrentUserPrimaryEmail(email) {
  let currentUser = cloneDeep(yield select(currentUserSelector()));
  currentUser.profileSummary = {
    ...currentUser.profileSummary,
    primaryEmail: email,
  };

  yield put(setUser({ data: currentUser }));
}

export function* addEmailToZEROAccount(action) {
  const { email, password } = action.payload;
  yield call(reset);

  const result = yield call(addEmailAccount, { email, password });
  if (result && result.success) {
    yield call(updateCurrentUserPrimaryEmail, email);
    yield call(closeAddEmailAccountModal);
    yield put(setSuccessMessage('Email added successfully'));
  }

  return;
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

function* listenForUserLogout() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogout);
    yield call(reset);
  }
}

export function* saga() {
  yield spawn(listenForUserLogout);

  yield takeLeading(SagaActionTypes.AddNewWallet, linkNewWalletToZEROAccount);
  yield takeLeading(SagaActionTypes.AddEmailAccount, addEmailToZEROAccount);

  yield takeLeading(SagaActionTypes.OpenWalletSelectModal, openWalletSelectModal);
  yield takeLeading(SagaActionTypes.CloseWalletSelectModal, closeWalletSelectModal);
  yield takeLeading(SagaActionTypes.OpenAddEmailAccountModal, openAddEmailAccountModal);
  yield takeLeading(SagaActionTypes.CloseAddEmailAccountModal, closeAddEmailAccountModal);
}
