import { call, put, takeLatest } from 'redux-saga/effects';
import { SagaActionTypes, Stage, setStage, setPublicReadReceipts } from '.';
import { setReadReceiptPreference } from '../../lib/chat';

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

export function* saga() {
  yield takeLatest(SagaActionTypes.OpenUserProfile, openUserProfile);
  yield takeLatest(SagaActionTypes.CloseUserProfile, closeUserProfile);
  yield takeLatest(SagaActionTypes.OpenEditProfile, openEditProfile);
  yield takeLatest(SagaActionTypes.OpenSettings, openSettings);
  yield takeLatest(SagaActionTypes.PrivateReadReceipts, onPrivateReadReceipts);
  yield takeLatest(SagaActionTypes.PublicReadReceipts, onPublicReadReceipts);
}
