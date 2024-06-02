import { put, takeLatest } from 'redux-saga/effects';
import { SagaActionTypes, Stage, setStage } from '.';

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

export function* saga() {
  yield takeLatest(SagaActionTypes.OpenUserProfile, openUserProfile);
  yield takeLatest(SagaActionTypes.CloseUserProfile, closeUserProfile);
  yield takeLatest(SagaActionTypes.OpenEditProfile, openEditProfile);
  yield takeLatest(SagaActionTypes.OpenSettings, openSettings);
}
