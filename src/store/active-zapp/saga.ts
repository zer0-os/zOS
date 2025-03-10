import { put, takeLatest } from 'redux-saga/effects';
import { SagaActionTypes, setActiveZAppManifestAction, clearActiveZAppManifestAction } from './index';

export function* setActiveZAppManifest(action) {
  yield put(setActiveZAppManifestAction(action.payload));
}

export function* clearActiveZAppManifest() {
  yield put(clearActiveZAppManifestAction());
}

export function* saga() {
  yield takeLatest(SagaActionTypes.SetActiveZAppManifest, setActiveZAppManifest);
  yield takeLatest(SagaActionTypes.ClearActiveZAppManifest, clearActiveZAppManifest);
}
