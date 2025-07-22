import { call, put, takeLatest, select, delay } from 'redux-saga/effects';
import { SagaActionTypes, Stage, setStage, setPublicReadReceipts, setShowZeroProNotification } from '.';
import { getReadReceiptPreference, setReadReceiptPreference } from '../../lib/chat';
import { reset as resetAccountManagementState } from '../account-management/saga';
import { resetHash } from '../utils';
import { userZeroProSubscriptionSelector } from '../authentication/selectors';
import { getAuthChannel, Events as AuthEvents } from '../authentication/channels';
import { takeEveryFromBus } from '../../lib/saga';

export function* openUserProfile() {
  yield put(setStage(Stage.Overview));
}

export function* closeUserProfile() {
  yield put(setStage(Stage.None));
}

export function* openEditProfile() {
  yield put(setStage(Stage.EditProfile));
}

export function* openSettings() {
  yield put(setStage(Stage.Settings));
}

export function* openDownloads() {
  yield put(setStage(Stage.Downloads));
}

export function* openAccountManagement() {
  yield call(resetAccountManagementState);
  yield put(setStage(Stage.AccountManagement));
}

export function* openLinkedAccounts() {
  yield put(setStage(Stage.LinkedAccounts));
}

export function* openZeroPro() {
  yield put(setStage(Stage.ZeroPro));
}

export function* closeZeroProNotification() {
  yield put(setShowZeroProNotification(false));
}

export function* checkZeroProNotification() {
  const isZeroProSubscriber = yield select(userZeroProSubscriptionSelector);

  if (isZeroProSubscriber) {
    return;
  }

  yield delay(10000);
  yield put(setShowZeroProNotification(true));
}

export function* onPrivateReadReceipts() {
  try {
    yield call(setReadReceiptPreference, 'private');
    yield put(setPublicReadReceipts(false));
  } catch (error) {
    console.error('Failed to set read receipt preference:', error);
  }
}

export function* onPublicReadReceipts() {
  try {
    yield call(setReadReceiptPreference, 'public');
    yield put(setPublicReadReceipts(true));
  } catch (error) {
    console.error('Failed to set read receipt preference:', error);
  }
}

export function* getUserReadReceiptPreference() {
  const preference = yield call(getReadReceiptPreference);

  if (preference === 'public') {
    yield put(setPublicReadReceipts(true));
  } else {
    yield put(setPublicReadReceipts(false));
  }
}

export function* saga() {
  // Note that this won't work in electron as it uses a hash router
  // Opening the native app from the web will be a future enhancement
  if (typeof window !== 'undefined' && window.location.hash !== '') {
    if (window.location.hash === '#linked-accounts') {
      yield call(openLinkedAccounts);
      yield call(resetHash);
    }
  }

  yield takeLatest(SagaActionTypes.OpenUserProfile, openUserProfile);
  yield takeLatest(SagaActionTypes.CloseUserProfile, closeUserProfile);
  yield takeLatest(SagaActionTypes.OpenEditProfile, openEditProfile);
  yield takeLatest(SagaActionTypes.OpenSettings, openSettings);
  yield takeLatest(SagaActionTypes.OpenDownloads, openDownloads);
  yield takeLatest(SagaActionTypes.OpenAccountManagement, openAccountManagement);
  yield takeLatest(SagaActionTypes.OpenLinkedAccounts, openLinkedAccounts);
  yield takeLatest(SagaActionTypes.OpenZeroPro, openZeroPro);
  yield takeLatest(SagaActionTypes.CloseZeroProNotification, closeZeroProNotification);
  yield takeLatest(SagaActionTypes.PrivateReadReceipts, onPrivateReadReceipts);
  yield takeLatest(SagaActionTypes.PublicReadReceipts, onPublicReadReceipts);

  yield takeEveryFromBus(yield call(getAuthChannel), AuthEvents.UserLogin, checkZeroProNotification);
}
