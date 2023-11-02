import { call, put, select, takeLatest } from 'redux-saga/effects';

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
  yield put(setLoaded(false));
  const chatClient = yield call(chat.get);
  const existingBackup = yield call([chatClient, chatClient.getSecureBackup]);
  if (!existingBackup || !existingBackup.backupInfo) {
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
  const chatClient = yield call(chat.get);
  const newBackup = yield call([chatClient, chatClient.generateSecureBackup]);
  yield put(setBackup(newBackup));
}

export function* saveBackup() {
  const backup = yield select((state) => state.matrix.backup);
  const chatClient = yield call(chat.get);
  const result = yield call([chatClient, chatClient.saveSecureBackup], backup);
  if (result.version) {
    yield put(setBackup(null));
    yield call(getBackup);
  }
}

export function* restoreBackup(action) {
  const chatClient = yield call(chat.get);
  const recoveryKey = action.payload;
  yield call([chatClient, chatClient.restoreSecureBackup], recoveryKey);
  yield call(getBackup);
}

export function* clearBackupState() {
  yield put(setLoaded(false));
  yield put(setTrustInfo(null));
  yield put(setBackup(null));
}
