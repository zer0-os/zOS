import { call, put, takeLatest } from 'redux-saga/effects';

import { SagaActionTypes, setLoading, setZero, setZeroPreviousDay } from '.';
import { RewardsResp, fetchRewards } from './api';
import { delay } from '../channels-list/saga';

const FETCH_REWARDS_INTERVAL = 60 * 60 * 1000; // 1 hour

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

export function* syncFetchRewards() {
  while (true) {
    yield call(fetch, {});

    yield call(delay, FETCH_REWARDS_INTERVAL);
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, syncFetchRewards);
}
