import getDeepProperty from 'lodash.get';
import { takeLatest, put, call } from 'redux-saga/effects';
import { SagaActionTypes, setUser } from '.';

import { authorize as authorizeApi, fetchCurrentUser, clearSession as clearSessionApi } from './api';

export interface Payload {
  signedWeb3Token: string;
}

export const currentUserSelector = () => (state) => {
  return getDeepProperty(state, 'authentication.user.data', null);
};

export function* authorize(action) {
  const { signedWeb3Token } = action.payload;

  yield call(authorizeApi, signedWeb3Token);

  yield call(getCurrentUser);
}

export function* clearSession() {
  yield call(clearSessionApi);
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
  yield takeLatest(SagaActionTypes.ClearSession, clearSession);
  yield takeLatest(SagaActionTypes.FetchCurrentUser, getCurrentUser);
}
