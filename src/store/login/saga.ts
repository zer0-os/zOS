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
import { getChallenge, authorizeSIWE, requestOTP } from '../authentication/api';
import { signSIWEMessage } from '../../lib/web3';
import { getWagmiConfig } from '../../lib/web3/wagmi-config';
import { getWalletClient } from '@wagmi/core';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { getHistory } from '../../lib/browser';
import { PayloadAction } from '@reduxjs/toolkit';
import { oauth2Link } from '../../lib/oauth/oauth2Link';
import { authenticateByEmail, authenticateByOAuth, authenticateByOTP, completeUserLogin } from '../authentication/saga';
import { linkSelector, nextSelector } from './selectors';
import { WalletClient } from 'viem';

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
    const wagmiConfig = yield call(getWagmiConfig);
    const walletClient: WalletClient = yield call(getWalletClient, wagmiConfig);

    if (!walletClient || !walletClient.account) {
      yield put(setErrors([Web3LoginErrors.UNKNOWN_ERROR]));
      return;
    }

    const address = walletClient.account.address;
    const domain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    const challenge = yield call(getChallenge, address, domain);
    const signature = yield call(signSIWEMessage, walletClient, address, challenge.message);
    const result = yield call(authorizeSIWE, challenge.message, signature);

    if (result.accessToken) {
      yield call(completeUserLogin);
      yield call(redirectToRoot);
    } else {
      yield put(setErrors([Web3LoginErrors.PROFILE_NOT_FOUND]));
    }
  } catch (e: any) {
    // Check if error is due to wallet not found (user doesn't exist)
    if (e?.response?.body?.code === 'PUBLIC_ADDRESS_NOT_FOUND') {
      yield put(setErrors([Web3LoginErrors.PROFILE_NOT_FOUND]));
    } else {
      yield put(setErrors([Web3LoginErrors.UNKNOWN_ERROR]));
    }
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

function* listenForUserLogin() {
  // This might be a little dicey. We dont' currently verify that your session
  // matches the web3 account that you're connected to when you refresh the page.
  const authChannel = yield call(getAuthChannel);

  while (true) {
    yield take(authChannel, AuthEvents.UserLogin);
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
