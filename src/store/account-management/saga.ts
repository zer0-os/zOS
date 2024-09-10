import { call, put, select, spawn, take, takeLeading } from 'redux-saga/effects';

import {
  Errors,
  SagaActionTypes,
  setAddEmailAccountModalStatus,
  setErrors,
  setState,
  setSuccessMessage,
  State,
} from '.';

import { addEmailAccount } from '../registration/saga';
import { currentUserSelector } from '../authentication/saga';
import { setUser } from '../authentication';
import cloneDeep from 'lodash/cloneDeep';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { getSignedToken } from '../web3/saga';
import { linkNewWalletToZEROAccount as apiLinkNewWalletToZEROAccount, LinkNewWalletToZEROAccountResponse } from './api';
import { getUserSubHandle } from '../../lib/user';

export function* reset() {
  yield put(setState(State.NONE));
  yield put(setErrors([]));
  yield put(setSuccessMessage(''));
}

export function* linkNewWalletToZEROAccount() {
  yield call(reset);

  yield put(setState(State.INPROGRESS));
  try {
    let result = yield call(getSignedToken);
    if (!result.success) {
      yield put(setErrors([result.error]));
      return;
    }

    const apiResult: LinkNewWalletToZEROAccountResponse = yield call(apiLinkNewWalletToZEROAccount, result.token);
    if (apiResult.success) {
      // other code
      yield call(updateCurrentUserWallets, apiResult.response.wallet, apiResult.response.primaryZID);
      yield put(setSuccessMessage('Wallet added successfully'));
    } else {
      yield put(setErrors([apiResult.error]));
      return;
    }
  } catch (e) {
    yield put(setErrors([Errors.UNKNOWN_ERROR]));
  } finally {
    yield put(setState(State.LOADED));
  }

  return;
}

export function* updateCurrentUserWallets({ publicAddress, ...walletRest }, primaryZID) {
  if (!publicAddress) {
    return; // Ensure wallet has a valid publicAddress
  }

  const currentUser = yield select(currentUserSelector());

  // Update wallets immutably
  const updatedWallets = [...(currentUser.wallets || []), { publicAddress, ...walletRest }];

  // Update primaryZID, either from the argument or derive from the wallet's publicAddress
  const updatedPrimaryZID = primaryZID || getUserSubHandle(undefined, publicAddress);

  yield put(
    setUser({
      data: {
        ...currentUser,
        wallets: updatedWallets,
        primaryZID: updatedPrimaryZID,
      },
    })
  );
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

  yield takeLeading(SagaActionTypes.OpenAddEmailAccountModal, openAddEmailAccountModal);
  yield takeLeading(SagaActionTypes.CloseAddEmailAccountModal, closeAddEmailAccountModal);
  yield takeLeading(SagaActionTypes.Reset, reset);
}
