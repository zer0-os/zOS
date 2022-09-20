import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setAccessToken } from '.';

import { authorize as authorizeApi } from './api';

export interface Payload {
  signedWeb3Token: string;
}

export function* authorize(action) {
  const { signedWeb3Token } = action.payload;

  const authorizationResponse = yield call(authorizeApi, signedWeb3Token);

  yield put(setAccessToken(authorizationResponse.accessToken));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Authorize, authorize);
}
