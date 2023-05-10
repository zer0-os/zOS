import { call, put, take } from 'redux-saga/effects';

import { SagaActionTypes, setLoading, setTotal } from '.';
import { fetchRewards } from './api';

export function* fetch(action) {
  yield put(setLoading(true));
  try {
    const result = yield call(fetchRewards, {});
    if (result.success) {
      yield put(setTotal(result.response.zero));
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
