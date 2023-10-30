import { put, select, takeLatest } from 'redux-saga/effects';

import { SagaActionTypes, setBackup, setLoaded, setTrustInfo } from '.';
import { chat } from '../../lib/chat';

export function* saga() {
  yield takeLatest(SagaActionTypes.GetBackup, getBackup);
  yield takeLatest(SagaActionTypes.GenerateBackup, generateBackup);
  yield takeLatest(SagaActionTypes.SaveBackup, saveBackup);
  yield takeLatest(SagaActionTypes.RestoreBackup, restoreBackup);
  yield takeLatest(SagaActionTypes.ClearBackup, clearBackupState);
}

export function* getBackup() {
  const existingBackup = yield chat.get().getSecureBackup();
  if (!existingBackup) {
    yield put(setTrustInfo(null));
  } else {
    yield put(
      setTrustInfo({
        usable: existingBackup.trustInfo.usable,
        trustedLocally: existingBackup.trustInfo.trusted_locally,
      })
    );
  }
  yield put(setLoaded(true));
}

export function* generateBackup() {
  const newBackup = yield chat.get().generateSecureBackup();
  yield put(setBackup(newBackup));
}

export function* saveBackup() {
  const backup = yield select((state) => state.matrix.backup);
  yield chat.get().saveSecureBackup(backup);
  yield put(setBackup(null));
  yield getBackup();
}

export function* restoreBackup(action) {
  const recoveryKey = action.payload;
  return yield chat.get().restoreSecureBackup(recoveryKey);
}

export function* clearBackupState() {
  yield put(setLoaded(false));
  yield put(setTrustInfo(null));
  yield put(setBackup(null));
}
