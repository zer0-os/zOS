import { call, put, take } from 'redux-saga/effects';

import { SagaActionTypes, setLoading, setZero, setZeroPreviousDay } from '.';
import { RewardsResp, fetchRewards } from './api';

export function* fetch(_action) {
  yield put(setLoading(true));
  try {
    const result: RewardsResp = yield call(fetchRewards, {});
    if (result.success) {
      yield put(setZero(result.response.zero.toString()));
      yield put(setZeroPreviousDay(result.response.zeroPreviousDay.toString()));
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
