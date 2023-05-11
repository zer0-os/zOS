import { call, put, take } from 'redux-saga/effects';

import { SagaActionTypes, setLoading, setZero } from '.';
import { fetchRewards } from './api';

export function* fetch(_action) {
  yield put(setLoading(true));
  try {
    const result = yield call(fetchRewards, {});
    if (result.success) {
      yield put(setZero(result.response.zero.toString()));
    } else {
    }
  } catch (e) {
  } finally {
    yield put(setLoading(false));
  }
}

export function* saga() {
  const action = yield take(SagaActionTypes.Fetch);
  yield call(fetch, action);
}
