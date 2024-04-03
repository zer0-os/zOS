import { call, delay, put, select, spawn, takeEvery } from 'redux-saga/effects';
import getDeepProperty from 'lodash.get';

import {
  SagaActionTypes,
  setShowRewardsInTooltip,
  setLoading,
  setMeow,
  setMeowInUSD,
  setMeowPreviousDay,
  setShowRewardsInPopup,
  setShowNewRewardsIndicator,
} from '.';
import { RewardsResp, fetchCurrentMeowPriceInUSD as fetchCurrentMeowPriceInUSDAPI, fetchRewards } from './api';
import { takeEveryFromBus } from '../../lib/saga';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { featureFlags } from '../../lib/feature-flags';

const FETCH_REWARDS_INTERVAL = 60 * 60 * 1000; // 1 hour
const SYNC_MEOW_TOKEN_PRICE_INTERVAL = 2 * 60 * 1000; // every 2 minutes

const lastDayRewardsKey = 'last_viewed_day_rewards';
const totalRewardsKey = 'last_viewed_total_rewards';

export function* fetchCurrentMeowPriceInUSD() {
  try {
    const result = yield call(fetchCurrentMeowPriceInUSDAPI);
    if (result.success) {
      yield put(setMeowInUSD(result.response.price));
    }
  } catch (e) {}
}

export function* fetch(_action) {
  yield put(setLoading(true));
  try {
    const result: RewardsResp = yield call(fetchRewards, {});
    if (result.success) {
      yield put(setMeow(result.response.meow.toString()));
      yield put(setMeowPreviousDay(result.response.meowPreviousDay.toString()));
    } else {
    }
  } catch (e) {
  } finally {
    yield put(setLoading(false));
  }

  yield call(checkNewRewardsLoaded);
}

export function* syncFetchRewards() {
  while (true) {
    yield call(fetch, {});

    yield delay(FETCH_REWARDS_INTERVAL);
  }
}

export function* syncMEOWPrice() {
  while (true) {
    yield call(fetchCurrentMeowPriceInUSD);

    yield delay(SYNC_MEOW_TOKEN_PRICE_INTERVAL);
  }
}

export function* syncRewardsAndTokenPrice() {
  if (!featureFlags.enableRewards) {
    return;
  }
  yield spawn(syncMEOWPrice);
  yield spawn(syncFetchRewards);
}

export function* closeRewardsTooltipAfterDelay() {
  yield delay(3000);
  yield call(closeRewardsTooltip);
}

export function* checkNewRewardsLoaded() {
  const isFirstTimeLogin = yield select((state) => getDeepProperty(state, 'registration.isFirstTimeLogin'));
  if (isFirstTimeLogin) {
    return;
  }

  const { meowPreviousDay, meow, meowInUSD: meowTokenPrice } = yield select((state) => state.rewards);
  if (meowTokenPrice === 0) {
    yield call(fetchCurrentMeowPriceInUSD);
  }

  if (meowPreviousDay !== '0') {
    if (localStorage.getItem(lastDayRewardsKey) !== meowPreviousDay) {
      yield put(setShowRewardsInTooltip(true));

      yield spawn(closeRewardsTooltipAfterDelay);
    }

    if (localStorage.getItem(totalRewardsKey) !== meow) {
      yield put(setShowNewRewardsIndicator(true));
    }
  }
}

export function* totalRewardsViewed() {
  const { meow } = yield select((state) => state.rewards);
  localStorage.setItem(totalRewardsKey, meow);
  yield put(setShowNewRewardsIndicator(false));
}

export function* closeRewardsTooltip() {
  // set last viewed "daily" rewards to the current rewards when the popup is closed
  const { meowPreviousDay, showRewardsInTooltip } = yield select((state) => state.rewards);
  if (showRewardsInTooltip) {
    localStorage.setItem(lastDayRewardsKey, meowPreviousDay);
    yield put(setShowRewardsInTooltip(false));
  }
}

function* clearOnLogout() {
  yield put(setLoading(false));
  yield put(setMeow('0'));
  yield put(setMeowPreviousDay('0'));
  yield put(setMeowInUSD(0.0));
  yield put(setShowRewardsInTooltip(false));
  yield put(setShowRewardsInPopup(false));
  yield put(setShowNewRewardsIndicator(false));
}

export function* saga() {
  yield takeEvery(SagaActionTypes.TotalRewardsViewed, totalRewardsViewed);
  yield takeEvery(SagaActionTypes.CloseRewardsTooltip, closeRewardsTooltip);
  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogin, syncRewardsAndTokenPrice);
  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogout, clearOnLogout);
}
