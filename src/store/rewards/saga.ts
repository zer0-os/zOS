import { call, delay, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import getDeepProperty from 'lodash.get';

import { SagaActionTypes, setLoading, setShowNewRewards, setZero, setZeroPreviousDay } from '.';
import { RewardsResp, fetchRewards } from './api';

const FETCH_REWARDS_INTERVAL = 60 * 60 * 1000; // 1 hour

const lastViewedRewardsKey = 'last_viewed_rewards';

export function* fetch(_action) {
  yield put(setLoading(true));
  try {
    const result: RewardsResp = yield call(fetchRewards, {});
    if (result.success) {
      yield put(setZero(result.response.zero.toString()));
      yield put(setZeroPreviousDay(result.response.zeroPreviousDay.toString()));

      yield call(checkNewRewardsLoaded);
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

    yield delay(FETCH_REWARDS_INTERVAL);
  }
}

export function* checkNewRewardsLoaded() {
  const zeroPreviousDay = yield select((state) => state.rewards.zeroPreviousDay);
  const isFirstTimeLogin = yield select((state) => state.registration.isFirstTimeLogin);
  const isMessengerFullScreen = yield select((state) => getDeepProperty(state, 'layout.value.isMessengerFullScreen'));

  if (
    isMessengerFullScreen &&
    !isFirstTimeLogin &&
    zeroPreviousDay !== '0' &&
    localStorage.getItem(lastViewedRewardsKey) !== zeroPreviousDay
  ) {
    yield put(setShowNewRewards(true));
  }
}

export function* rewardsPopupClosed() {
  // set last viewed rewards to the current rewards when the popup is closed
  const { zeroPreviousDay, showNewRewards } = yield select((state) => state.rewards);
  if (showNewRewards) {
    localStorage.setItem(lastViewedRewardsKey, zeroPreviousDay);
    yield put(setShowNewRewards(false));
  }
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, syncFetchRewards);
  yield takeEvery(SagaActionTypes.RewardsPopupClosed, rewardsPopupClosed);
}
