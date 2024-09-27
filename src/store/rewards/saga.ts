import { call, delay, put, select, spawn, takeEvery } from 'redux-saga/effects';
import getDeepProperty from 'lodash.get';
import BN from 'bn.js';

import {
  SagaActionTypes,
  setShowRewardsInTooltip,
  setLoading,
  setMeow,
  setMeowInUSD,
  setMeowPreviousDay,
  setShowRewardsInPopup,
  setShowNewRewardsIndicator,
  setTransferError,
  setTransferLoading,
} from '.';
import {
  RewardsResp,
  fetchCurrentMeowPriceInUSD as fetchCurrentMeowPriceInUSDAPI,
  fetchRewards,
  transferMeow as transferMeowAPI,
} from './api';
import { takeEveryFromBus } from '../../lib/saga';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { currentUserSelector } from '../authentication/saga';
import { featureFlags } from '../../lib/feature-flags';
import { sendMeowReactionEvent } from '../../lib/chat';

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

export function* transferMeow(action) {
  yield put(setTransferError({ error: null }));

  const { meowSenderId, postOwnerId, postMessageId, meowAmount, roomId } = action.payload;

  if (meowSenderId === postOwnerId) {
    yield put(setTransferError({ error: 'Cannot transfer MEOW to yourself.' }));
    return;
  }

  yield put(setTransferLoading(true));

  try {
    const result = yield call(transferMeowAPI, meowSenderId, postOwnerId, meowAmount);

    if (result.success) {
      yield put(setMeow(result.response.senderBalance));

      yield call(sendMeowReactionEvent, roomId, postMessageId, postOwnerId, meowAmount);
    } else {
      yield put(setTransferError({ error: result.error }));
    }
  } catch (error: any) {
    yield put(setTransferError({ error: error.message || 'An unexpected error occurred.' }));
  } finally {
    yield put(setTransferLoading(false));
  }
}

export function* updateUserMeowBalance(postOwnerId: string, amount: number) {
  const currentUser = yield select(currentUserSelector());

  if (postOwnerId === currentUser.id) {
    const currentMeowBalance = yield select((state) => state.rewards.meow);

    const amountInWei = new BN(amount).mul(new BN('1000000000000000000'));
    const newMeowBalance = new BN(currentMeowBalance).add(amountInWei);

    yield put(setMeow(newMeowBalance.toString()));
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
  yield put(setTransferError({ error: '' }));
}

export function* saga() {
  yield takeEvery(SagaActionTypes.TotalRewardsViewed, totalRewardsViewed);
  yield takeEvery(SagaActionTypes.CloseRewardsTooltip, closeRewardsTooltip);
  yield takeEvery(SagaActionTypes.TransferMeow, transferMeow);
  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogin, syncRewardsAndTokenPrice);
  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogout, clearOnLogout);
}
