import { call, put, take, takeEvery, takeLatest } from 'redux-saga/effects';

import { emailLogin as apiEmailLogin } from './api';
import { EmailLoginErrors, LoginStage, SagaActionTypes, Web3LoginErrors, setErrors, setLoading, setStage } from '.';
import { getSignedToken } from '../web3/saga';
import { nonceOrAuthorize } from '../authentication/saga';
import { setWalletModalOpen } from '../web3';

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
    let result = yield call(getSignedToken, connector);
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

/**
 * Switches login stage. Used for switching between login options when logging in.
 */
export function* switchLoginStage(action) {
  yield put(setErrors([]));
  yield put(setStage(action.payload));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Web3Login, web3Login);
  yield takeEvery(SagaActionTypes.SwitchLoginStage, switchLoginStage); // Add this line

  let success;
  do {
    const action = yield take(SagaActionTypes.EmailLogin);
    success = yield call(emailLogin, action);
  } while (!success);
}
