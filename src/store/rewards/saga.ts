import { call, delay, put, select, spawn, takeEvery, takeLatest } from 'redux-saga/effects';
import getDeepProperty from 'lodash.get';

import {
  SagaActionTypes,
  setShowRewardsTooltip,
  setLoading,
  setZero,
  setZeroInUSD,
  setZeroPreviousDay,
  setShowRewardsModal,
} from '.';
import { RewardsResp, fetchCurrentZeroPriceInUSD as fetchCurrentZeroPriceInUSDAPI, fetchRewards } from './api';
import { takeEveryFromBus } from '../../lib/saga';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';

const FETCH_REWARDS_INTERVAL = 60 * 60 * 1000; // 1 hour
const SYNC_ZERO_TOKEN_PRICE_INTERVAL = 2 * 60 * 1000; // every 2 minutes

const lastDayRewardsKey = 'last_viewed_day_rewards';
const totalRewardsKey = 'last_viewed_total_rewards';

export function* fetchCurrentZeroPriceInUSD() {
  try {
    const result = yield call(fetchCurrentZeroPriceInUSDAPI);
    if (result.success) {
      yield put(setZeroInUSD(result.response.price));
    }
  } catch (e) {}
}

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

export function* syncZEROPrice() {
  while (true) {
    yield call(fetchCurrentZeroPriceInUSD);

    yield delay(SYNC_ZERO_TOKEN_PRICE_INTERVAL);
  }
}

export function* syncRewardsAndTokenPrice() {
  yield spawn(syncFetchRewards);
  yield spawn(syncZEROPrice);
}

export function* checkNewRewardsLoaded() {
  const zeroPreviousDay = yield select((state) => getDeepProperty(state, 'rewards.zeroPreviousDay'));
  const zeroTotal = yield select((state) => getDeepProperty(state, 'rewards.zero'));
  const isFirstTimeLogin = yield select((state) => getDeepProperty(state, 'registration.isFirstTimeLogin'));
  const isMessengerFullScreen = yield select((state) => getDeepProperty(state, 'layout.value.isMessengerFullScreen'));

  if (isMessengerFullScreen && !isFirstTimeLogin && zeroPreviousDay !== '0') {
    if (localStorage.getItem(lastDayRewardsKey) !== zeroPreviousDay) {
      yield put(setShowRewardsTooltip(true));
    }

    if (localStorage.getItem(totalRewardsKey) !== zeroTotal) {
      yield put(setShowRewardsModal(true));
    }
  }
}

export function* rewardsPopupClosed() {
  // set last viewed "total" rewards to the current rewards when the popup is closed
  const { zero, showRewardsModal } = yield select((state) => state.rewards);
  if (showRewardsModal) {
    localStorage.setItem(totalRewardsKey, zero);
    yield put(setShowRewardsModal(false));
  }
}

export function* rewardsTooltipClosed() {
  // set last viewed "daily" rewards to the current rewards when the popup is closed
  const { zeroPreviousDay, showRewardsTooltip } = yield select((state) => state.rewards);
  if (showRewardsTooltip) {
    localStorage.setItem(lastDayRewardsKey, zeroPreviousDay);
    yield put(setShowRewardsTooltip(false));
  }
}

function* clearOnLogout() {
  yield put(setLoading(false));
  yield put(setZero('0'));
  yield put(setZeroPreviousDay('0'));
  yield put(setZeroInUSD(0.0));
  yield put(setShowRewardsTooltip(false));
  yield put(setShowRewardsModal(false));
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, syncRewardsAndTokenPrice);
  yield takeEvery(SagaActionTypes.RewardsPopupClosed, rewardsPopupClosed);
  yield takeEvery(SagaActionTypes.RewardsTooltipClosed, rewardsTooltipClosed);
  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogout, clearOnLogout);
}
