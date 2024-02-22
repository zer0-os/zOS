import { call, delay, put, select, takeLatest } from 'redux-saga/effects';

import {
  SagaActionTypes,
  setGeneratedRecoveryKey,
  setDeviceId,
  setErrorMessage,
  setLoaded,
  setSuccessMessage,
  setTrustInfo,
  setIsBackupCheckComplete,
  setIsBackupDialogOpen,
} from '.';
import { chat } from '../../lib/chat';

export function* saga() {
  yield takeLatest(SagaActionTypes.GetBackup, getBackup);
  yield takeLatest(SagaActionTypes.GenerateBackup, generateBackup);
  yield takeLatest(SagaActionTypes.SaveBackup, saveBackup);
  yield takeLatest(SagaActionTypes.RestoreBackup, restoreBackup);
  yield takeLatest(SagaActionTypes.ClearBackup, clearBackupState);

  // For debugging
  yield takeLatest(SagaActionTypes.DebugDeviceList, debugDeviceList);
  yield takeLatest(SagaActionTypes.DebugRoomKeys, debugRoomKeys);
  yield takeLatest(SagaActionTypes.FetchDeviceInfo, getDeviceInfo);
  yield takeLatest(SagaActionTypes.ResendKeyRequests, resendKeyRequests);
  yield takeLatest(SagaActionTypes.DiscardOlm, discardOlm);
  yield takeLatest(SagaActionTypes.RestartOlm, restartOlm);
  yield takeLatest(SagaActionTypes.ShareHistoryKeys, shareHistoryKeys);
  yield takeLatest(SagaActionTypes.CloseBackupDialog, closeBackupDialog);
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
        isLegacy: existingBackup.isLegacy,
      })
    );
  }
  yield put(setLoaded(true));
}

export function* generateBackup() {
  const chatClient = yield call(chat.get);
  const key = yield call([chatClient, chatClient.generateSecureBackup]);
  yield put(setGeneratedRecoveryKey(key));
}

export function* saveBackup() {
  yield put(setSuccessMessage(''));
  yield put(setErrorMessage(''));
  const key = yield select((state) => state.matrix.generatedRecoveryKey);
  const chatClient = yield call(chat.get);
  try {
    yield call([chatClient, chatClient.saveSecureBackup], key);
    yield put(setGeneratedRecoveryKey(null));
    yield call(getBackup);
    yield put(setSuccessMessage('Backup saved successfully'));
  } catch {
    yield put(setErrorMessage('Backup save failed'));
  }
}

export function* restoreBackup(action) {
  yield put(setSuccessMessage(''));
  yield put(setErrorMessage(''));
  const chatClient = yield call(chat.get);
  const recoveryKey = action.payload;
  try {
    yield call([chatClient, chatClient.restoreSecureBackup], recoveryKey);
    yield call(getBackup);
    yield put(setSuccessMessage('Backup restored successfully'));
  } catch (e) {
    yield put(setErrorMessage('Failed to restore backup: Check your recovery key and try again'));
  }
}

export function* clearBackupState() {
  yield put(setLoaded(false));
  yield put(setTrustInfo(null));
  yield put(setGeneratedRecoveryKey(null));
  yield put(setSuccessMessage(''));
  yield put(setErrorMessage(''));
}

export function* debugDeviceList(action) {
  const chatClient = yield call(chat.get);
  yield call([chatClient, chatClient.displayDeviceList], action.payload);
}

export function* debugRoomKeys(action) {
  const chatClient = yield call(chat.get);
  yield call([chatClient, chatClient.displayRoomKeys], action.payload);
}

export function* getDeviceInfo() {
  const chatClient = yield call(chat.get);
  const deviceId = yield call([chatClient, chatClient.getDeviceInfo]);

  yield put(setDeviceId(deviceId));
}

export function* resendKeyRequests() {
  const chatClient = yield call(chat.get);
  yield call([chatClient, chatClient.cancelAndResendKeyRequests]);
}

export function* discardOlm(action) {
  const chatClient = yield call(chat.get);
  yield call([chatClient, chatClient.discardOlmSession], action.payload);
}

export function* restartOlm(action) {
  const chatClient = yield call(chat.get);
  yield call([chatClient, chatClient.resetOlmSession], action.payload);
}

export function* shareHistoryKeys(action) {
  const chatClient = yield call(chat.get);
  yield call([chatClient, chatClient.shareHistoryKeys], action.payload.roomId, action.payload.userIds);
}

export function* manageSecureBackupPrompt() {
  const isBackupCheckComplete = yield select((state) => state.matrix.isBackupCheckComplete);

  if (!isBackupCheckComplete) {
    const chatClient = yield call(chat.get);
    const backupExists = yield call([chatClient, chatClient.getSecureBackup]);

    if (!backupExists || !backupExists.backupInfo) {
      yield delay(10000);
      yield put(setIsBackupDialogOpen(true));
    }

    yield put(setIsBackupCheckComplete(true));
  }
}

export function* closeBackupDialog() {
  yield put(setIsBackupDialogOpen(false));
}
