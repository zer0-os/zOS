import { call, put, take, takeLatest } from 'redux-saga/effects';

import { emailLogin as apiEmailLogin } from './api';
import { EmailLoginErrors, LoginStage, SagaActionTypes, Web3LoginErrors, setErrors, setLoading, setStage } from '.';
import { getSignedToken, getSignedTokenForConnector, updateConnector } from '../web3/saga';
import { logout, nonceOrAuthorize, terminate } from '../authentication/saga';
import { setWalletModalOpen } from '../web3';
import { Connectors } from '../../lib/web3';

export function* emailLogin(action) {
  const { email, password } = action.payload;

  yield put(setLoading(true));
  yield put(setErrors([]));
  try {
    const validationErrors = yield call(validateEmailLogin, { email, password });
    if (validationErrors.length) {
      yield put(setErrors(validationErrors));
      return false;
    }

    const result = yield call(apiEmailLogin, { email, password });
    if (result.success) {
      yield put(setStage(LoginStage.Done));
      return true;
    } else {
      yield put(setErrors([result.response]));
    }
  } catch (e) {
    yield put(setErrors([EmailLoginErrors.UNKNOWN_ERROR]));
  } finally {
    yield put(setLoading(false));
  }
  return false;
}

export function validateEmailLogin({ email, password }) {
  const validationErrors = [];

  if (!email.trim()) {
    validationErrors.push(EmailLoginErrors.EMAIL_REQUIRED);
  }

  if (!password.trim()) {
    validationErrors.push(EmailLoginErrors.PASSWORD_REQUIRED);
  }

  return validationErrors;
}

export function* web3Login(action) {
  const connector = action.payload;

  yield put(setLoading(true));
  yield put(setErrors([]));
  try {
    let result = yield call(getSignedTokenForConnector, connector);
    if (!result.success) {
      yield put(setErrors([result.error]));
      return;
    }

    result = yield call(nonceOrAuthorize, { payload: { signedWeb3Token: result.token } });
    if (result.nonce) {
      // For now, receiving a nonce means we are not logged in as it wants you
      // to create a new account. This is to support the existing zOS flow where you can
      // create a new account from the public zOS UI.
      yield put(setErrors([Web3LoginErrors.PROFILE_NOT_FOUND]));
    } else {
      yield put(setStage(LoginStage.Done));
    }
    // Note: only impacts public zOS. Keeping the two flows together for now while things are refactored.
    yield put(setWalletModalOpen(false));
  } finally {
    yield put(setLoading(false));
  }
}

export function* web3ChangeAccount() {
  let result = yield call(getSignedToken);
  if (!result.success) {
    // I'm not sure if this is the right thing to do.
    // If you don't sign the token and we reset this to None
    // then the connector is in a weird state where we have your
    // newly selected address but you're logged into a different account
    yield call(updateConnector, { payload: Connectors.None });
  }

  yield call(terminate);

  result = yield call(nonceOrAuthorize, { payload: { signedWeb3Token: result.token } });
  if (result.nonce) {
    // For now, receiving a nonce means we are not logged in as it wants you
    // to create a new account. This is to support the existing zOS flow where you can
    // create a new account from the public zOS UI.
    yield put(setErrors([Web3LoginErrors.PROFILE_NOT_FOUND]));
  } else {
    yield put(setStage(LoginStage.Done));
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Web3Login, web3Login);
  // XXX: this should only be happening if we logged in via web3
  yield takeLatest(SagaActionTypes.Web3ChangeAccount, web3ChangeAccount);

  let success;
  do {
    const action = yield take(SagaActionTypes.EmailLogin);
    success = yield call(emailLogin, action);
  } while (!success);
}
