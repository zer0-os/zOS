import { call, delay, put, select, spawn, takeEvery, takeLatest } from 'redux-saga/effects';
import getDeepProperty from 'lodash.get';

import {
  SagaActionTypes,
  setShowRewardsInTooltip,
  setLoading,
  setMeow,
  setMeowInUSD,
  setMeowPreviousDay,
  setShowRewardsInPopup,
} from '.';
import { RewardsResp, fetchCurrentMeowPriceInUSD as fetchCurrentMeowPriceInUSDAPI, fetchRewards } from './api';
import { takeEveryFromBus } from '../../lib/saga';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { featureFlags } from '../../lib/feature-flags';

const FETCH_REWARDS_INTERVAL = 60 * 60 * 1000; // 1 hour
const SYNC_ZERO_TOKEN_PRICE_INTERVAL = 2 * 60 * 1000; // every 2 minutes

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
      yield put(setMeow(result.response.zero.toString()));
      yield put(setMeowPreviousDay(result.response.zeroPreviousDay.toString()));

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

export function* syncMEOWPrice() {
  while (true) {
    yield call(fetchCurrentMeowPriceInUSD);

    yield delay(SYNC_ZERO_TOKEN_PRICE_INTERVAL);
  }
}

export function* syncRewardsAndTokenPrice() {
  if (!featureFlags.enableRewards || featureFlags.enableMatrix) {
    return;
  }

  yield spawn(syncFetchRewards);
  yield spawn(syncMEOWPrice);
}

export function* checkNewRewardsLoaded() {
  const meowPreviousDay = yield select((state) => getDeepProperty(state, 'rewards.meowPreviousDay'));
  const meowTotal = yield select((state) => getDeepProperty(state, 'rewards.meow'));
  const isFirstTimeLogin = yield select((state) => getDeepProperty(state, 'registration.isFirstTimeLogin'));
  const isMessengerFullScreen = yield select((state) => getDeepProperty(state, 'layout.value.isMessengerFullScreen'));

  if (isMessengerFullScreen && !isFirstTimeLogin && meowPreviousDay !== '0') {
    if (localStorage.getItem(lastDayRewardsKey) !== meowPreviousDay) {
      yield put(setShowRewardsInTooltip(true));
    }

    if (localStorage.getItem(totalRewardsKey) !== meowTotal) {
      yield put(setShowRewardsInPopup(true));
    }
  }
}

export function* rewardsPopupClosed() {
  // set last viewed "total" rewards to the current rewards when the popup is closed
  const { meow, showRewardsInPopup } = yield select((state) => state.rewards);
  if (showRewardsInPopup) {
    localStorage.setItem(totalRewardsKey, meow);
    yield put(setShowRewardsInPopup(false));
  }
}

export function* rewardsTooltipClosed() {
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
}

export function* saga() {
  yield takeLatest(SagaActionTypes.Fetch, syncRewardsAndTokenPrice);
  yield takeEvery(SagaActionTypes.RewardsPopupClosed, rewardsPopupClosed);
  yield takeEvery(SagaActionTypes.RewardsTooltipClosed, rewardsTooltipClosed);
  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogout, clearOnLogout);
}
