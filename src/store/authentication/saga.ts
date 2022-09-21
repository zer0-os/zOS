import { config } from './../../config';
import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setAccessToken } from '.';

import { authorize as authorizeApi } from './api';

export interface Payload {
  signedWeb3Token: string;
}

export function* authorize(action) {
  const { signedWeb3Token } = action.payload;

  const authorizationResponse = yield call(authorizeApi, signedWeb3Token);
  const accessToken = authorizationResponse.accessToken;

  localStorage.setItem(config.accessTokenCookieName, accessToken);

  yield put(setAccessToken(accessToken));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Authorize, authorize);
}
