import { call, put, race, spawn, take, takeLatest } from 'redux-saga/effects';

import {
  EmailLoginErrors,
  LoginStage,
  SagaActionTypes,
  Web3LoginErrors,
  reset,
  setErrors,
  setLoading,
  setStage,
} from '.';
import { getSignedToken, getSignedTokenForConnector, isWeb3AccountConnected } from '../web3/saga';
import { authenticateByEmail, logout, nonceOrAuthorize, terminate } from '../authentication/saga';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { Web3Events, getWeb3Channel } from '../web3/channels';

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

    const result = yield call(authenticateByEmail, email, password);
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

export function* web3ChangeAccount() {
  let result = yield call(getSignedToken);
  if (!result.success) {
    // If you reject signing the token, we log you out so we don't end up
    // in a weird state where the cookie doesn't match the current connection.
    // You an always log back in. It may not be ideal but at least we're not in
    // a corrupt state.
    yield call(logout);
    return;
  }

  yield call(terminate, true);

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

function* listenForWeb3AccountChanges() {
  const authChannel = yield call(getAuthChannel);
  const web3Channel = yield call(getWeb3Channel);
  const result = yield race({
    accountChanged: take(web3Channel, Web3Events.AddressChanged),
    logout: take(authChannel, AuthEvents.UserLogout),
  });

  if (result.logout) {
    return;
  }

  yield call(web3ChangeAccount);
}

function* listenForUserLogin() {
  // This might be a little dicey. We dont' currently verify that your session
  // matches the web3 account that you're connected to when you refresh the page.
  const authChannel = yield call(getAuthChannel);

  while (true) {
    yield take(authChannel, AuthEvents.UserLogin);

    if (yield call(isWeb3AccountConnected)) {
      yield spawn(listenForWeb3AccountChanges);
    }
  }
}

function* listenForUserLogout() {
  const authChannel = yield call(getAuthChannel);
  while (true) {
    yield take(authChannel, AuthEvents.UserLogout);
    yield put(reset());
  }
}

export function* saga() {
  yield spawn(listenForUserLogin);
  yield spawn(listenForUserLogout);
  yield takeLatest(SagaActionTypes.EmailLogin, emailLogin);
  yield takeLatest(SagaActionTypes.Web3Login, web3Login);
  yield takeLatest(SagaActionTypes.SwitchLoginStage, switchLoginStage);
}
