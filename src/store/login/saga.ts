import { call, put, select, spawn, take, takeLatest } from 'redux-saga/effects';

import {
  EmailLoginErrors,
  SagaActionTypes,
  Web3LoginErrors,
  reset,
  setErrors,
  setLoading,
  setStage,
  LoginStage,
  setOTPStage,
  OTPStage,
  LoginByOTPPayload,
  VerifyOTPPayload,
  LoginByEmailPayload,
  setLink,
  setNext,
} from '.';
import { getSignedToken, isWeb3AccountConnected } from '../web3/saga';
import {
  authenticateByEmail,
  authenticateByOAuth,
  authenticateByOTP,
  forceLogout,
  nonceOrAuthorize,
  terminate,
} from '../authentication/saga';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { getHistory } from '../../lib/browser';
import { requestOTP } from '../authentication/api';
import { PayloadAction } from '@reduxjs/toolkit';
import { oauth2Link } from '../../lib/oauth/oauth2Link';
import { linkSelector, nextSelector } from './selectors';

export function* otpLogin(action: PayloadAction<LoginByOTPPayload>) {
  const { email } = action.payload;

  yield put(setLoading(true));
  yield put(setErrors([]));
  try {
    const result = yield call(requestOTP, { email });
    if (result.success) {
      yield put(setErrors([]));
      yield put(setOTPStage(OTPStage.Verify));
    } else {
      yield put(setErrors([result.response]));
    }
  } catch (e) {
    yield put(setErrors([EmailLoginErrors.UNKNOWN_ERROR]));
  } finally {
    yield put(setLoading(false));
  }
}

export function* otpVerify(action: PayloadAction<VerifyOTPPayload>) {
  const { email, code } = action.payload;

  yield put(setLoading(true));
  yield put(setErrors([]));
  try {
    const result = yield call(authenticateByOTP, email, code);
    if (result.success) {
      yield put(setErrors([]));
      yield call(redirectToRoot);
    } else {
      yield put(setErrors([result.response]));
    }
  } catch (e) {
    yield put(setErrors([EmailLoginErrors.UNKNOWN_ERROR]));
  } finally {
    yield put(setLoading(false));
  }
}

export function* emailLogin(action: PayloadAction<LoginByEmailPayload>) {
  const { email, password } = action.payload;

  yield put(setLoading(true));
  yield put(setErrors([]));
  try {
    const validationErrors = yield call(validateEmailLogin, { email, password });
    if (validationErrors.length) {
      yield put(setErrors(validationErrors));
      return;
    }

    const result = yield call(authenticateByEmail, email, password);
    if (result.success) {
      yield call(redirectToRoot);
    } else {
      yield put(setErrors([result.response]));
    }
  } catch (e) {
    yield put(setErrors([EmailLoginErrors.UNKNOWN_ERROR]));
  } finally {
    yield put(setLoading(false));
  }
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

export function* web3Login() {
  yield put(setLoading(true));
  yield put(setErrors([]));
  try {
    let result = yield call(getSignedToken);
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
      yield call(redirectToRoot);
    }
  } catch (e) {
    yield put(setErrors([Web3LoginErrors.UNKNOWN_ERROR]));
  } finally {
    yield put(setLoading(false));
  }
}

export function* oauthLogin(action: PayloadAction<string>) {
  const sessionToken = action.payload;

  const result = yield call(authenticateByOAuth, sessionToken);
  if (result.success) {
    yield call(redirectToRoot);
  } else {
    yield put(setErrors([result.response]));
  }
}

export function* switchLoginStage(action: PayloadAction<LoginStage>) {
  yield put(setErrors([]));
  yield put(setOTPStage(OTPStage.Login));
  yield put(setStage(action.payload));
}

export function* web3ChangeAccount() {
  let result = yield call(getSignedToken);
  if (!result.success) {
    // If you reject signing the token, we log you out so we don't end up
    // in a weird state where the cookie doesn't match the current connection.
    // You an always log back in. It may not be ideal but at least we're not in
    // a corrupt state.
    yield call(forceLogout);
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
    yield redirectToRoot();
  }
}

/*
 * @note 26 Nov 2024
 * This is commented out as it is currently not the desired functionality.
 * User state should persist between web3 account changes.
 */
// function* listenForWeb3AccountChanges() {
//   const authChannel = yield call(getAuthChannel);
//   const web3Channel = yield call(getWeb3Channel);
//   const result = yield race({
//     accountChanged: take(web3Channel, Web3Events.AddressChanged),
//     logout: take(authChannel, AuthEvents.UserLogout),
//   });

//   if (result.logout) {
//     return;
//   }

//   yield call(web3ChangeAccount);
// }

function* listenForUserLogin() {
  // This might be a little dicey. We dont' currently verify that your session
  // matches the web3 account that you're connected to when you refresh the page.
  const authChannel = yield call(getAuthChannel);

  while (true) {
    yield take(authChannel, AuthEvents.UserLogin);

    if (yield call(isWeb3AccountConnected)) {
      /*
       * @note 26 Nov 2024
       * This is commented out as it is currently not the desired functionality.
       * User state should persist between web3 account changes.
       */
      // yield spawn(listenForWeb3AccountChanges);
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

function* checkInitialLoginStage() {
  const link = yield select(linkSelector);

  if (link) {
    yield put(setStage(LoginStage.EmailLogin));
  }
}

function* storeParams() {
  const history = yield call(getHistory);
  if (!history.location.pathname.includes('/login')) return;

  const searchParams = new URLSearchParams(history.location.search);
  const link = searchParams.get('link');
  const next = searchParams.get('next');

  if (link) {
    yield put(setLink(link));
  }

  if (next) {
    yield put(setNext(next));
  }
}

export function* saga() {
  yield call(storeParams);
  yield call(checkInitialLoginStage);
  yield spawn(listenForUserLogin);
  yield spawn(listenForUserLogout);
  yield takeLatest(SagaActionTypes.EmailLogin, emailLogin);
  yield takeLatest(SagaActionTypes.Web3Login, web3Login);
  yield takeLatest(SagaActionTypes.OAuthLogin, oauthLogin);
  yield takeLatest(SagaActionTypes.OTPLogin, otpLogin);
  yield takeLatest(SagaActionTypes.OTPVerify, otpVerify);
  yield takeLatest(SagaActionTypes.SwitchLoginStage, switchLoginStage);
}

export function* redirectToRoot() {
  const link = yield select(linkSelector);
  const next = yield select(nextSelector);

  if (link) {
    if (link === 'epic-games') {
      yield call(oauth2Link, 'epic-games', false);
      return;
    }
  }

  if (next) {
    window.location.href = next;
  } else {
    yield getHistory().replace({ pathname: '/' });
  }
}
