import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setUser } from '.';

import { authorize as authorizeApi, fetchCurrentUser } from './api';

export interface Payload {
  signedWeb3Token: string;
}

export function* authorize(action) {
  const { signedWeb3Token } = action.payload;

  yield call(authorizeApi, signedWeb3Token);

  yield call(getCurrentUser);
}

export function* getCurrentUser() {
  yield put(setUser({ data: null, isLoading: true }));
  const user = yield call(fetchCurrentUser);

  yield put(
    setUser({
      data: user,
      isLoading: false,
    })
  );
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Authorize, authorize);
  yield takeLatest(SagaActionTypes.FetchCurrentUser, getCurrentUser);
}
