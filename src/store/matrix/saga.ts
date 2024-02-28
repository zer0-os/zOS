import { call, delay, put, select, spawn, take, takeLatest } from 'redux-saga/effects';

import {
  SagaActionTypes,
  setGeneratedRecoveryKey,
  setDeviceId,
  setErrorMessage,
  setLoaded,
  setSuccessMessage,
  setIsBackupDialogOpen,
  setBackupStage,
  BackupStage,
  setBackupExists,
  setBackupRestored,
  MatrixState,
} from '.';
import { chat, getSecureBackup } from '../../lib/chat';
import { performUnlessLogout } from '../utils';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { ChatMessageEvents, getChatMessageBus } from '../messages/messages';
import { waitForChatConnectionCompletion } from '../chat/saga';

export function* saga() {
  yield spawn(listenForUserLogin);
  yield spawn(listenForUserLogout);

  yield takeLatest(SagaActionTypes.GetBackup, getBackup);
  yield takeLatest(SagaActionTypes.GenerateBackup, generateBackup);
  yield takeLatest(SagaActionTypes.SaveBackup, saveBackup);
  yield takeLatest(SagaActionTypes.RestoreBackup, restoreBackup);
  yield takeLatest(SagaActionTypes.ClearBackup, clearBackupState);
  yield takeLatest(SagaActionTypes.OpenBackupDialog, userInitiatedBackupDialog);
  yield takeLatest(SagaActionTypes.CloseBackupDialog, closeBackupDialog);
  yield takeLatest(SagaActionTypes.VerifyKey, proceedToVerifyKey);

  // For debugging
  yield takeLatest(SagaActionTypes.DebugDeviceList, debugDeviceList);
  yield takeLatest(SagaActionTypes.DebugRoomKeys, debugRoomKeys);
  yield takeLatest(SagaActionTypes.FetchDeviceInfo, getDeviceInfo);
  yield takeLatest(SagaActionTypes.ResendKeyRequests, resendKeyRequests);
  yield takeLatest(SagaActionTypes.DiscardOlm, discardOlm);
  yield takeLatest(SagaActionTypes.RestartOlm, restartOlm);
  yield takeLatest(SagaActionTypes.ShareHistoryKeys, shareHistoryKeys);
}

export function* getBackup() {
  yield put(setLoaded(false));
  let trustInfo = null;

  const existingBackup = yield call(getSecureBackup);
  if (existingBackup?.backupInfo) {
    trustInfo = {
      usable: existingBackup.trustInfo.usable,
      trustedLocally: existingBackup.trustInfo.trusted_locally,
      isLegacy: existingBackup.isLegacy,
    };
  }

  const backupData = yield call(updateTrustInfo, trustInfo);
  yield put(setLoaded(true));

  return backupData.trustInfo;
}

export function* updateTrustInfo(trustInfo: { usable: boolean; trustedLocally: boolean; isLegacy: boolean } | null) {
  const data = { trustInfo };

  yield put(setBackupExists(!!trustInfo && !trustInfo.isLegacy));
  yield put(setBackupRestored(isBackupRestored(trustInfo) && !trustInfo?.isLegacy));

  return data;
}

export function* generateBackup() {
  yield put(setErrorMessage(''));
  yield put(setBackupStage(BackupStage.GenerateBackup));

  const existingKey = yield select((state) => state.matrix.generatedRecoveryKey);
  if (existingKey) {
    yield put(setGeneratedRecoveryKey(existingKey));
    return;
  }

  const chatClient = yield call(chat.get);

  try {
    const key = yield call([chatClient, chatClient.generateSecureBackup]);
    yield put(setGeneratedRecoveryKey(key));
  } catch (error) {
    yield put(setErrorMessage('Failed to generate backup key. Please try again.'));
    yield call(userInitiatedBackupDialog);
  }
}

export function* proceedToVerifyKey() {
  const existingKey = yield select((state) => state.matrix.generatedRecoveryKey);

  if (existingKey) {
    yield put(setBackupStage(BackupStage.VerifyKeyPhrase));
  } else {
    yield put(setBackupStage(BackupStage.RestoreBackup));
  }
}

export function* saveBackup(action) {
  yield put(setSuccessMessage(''));
  yield put(setErrorMessage(''));
  const generatedKey = yield select((state) => state.matrix.generatedRecoveryKey);
  const userInputKeyPhrase = action.payload;

  if (userInputKeyPhrase !== generatedKey) {
    yield put(setErrorMessage('The phrase you entered does not match. Backup phrases are case sensitive'));
    return;
  }

  const chatClient = yield call(chat.get);
  try {
    yield call([chatClient, chatClient.saveSecureBackup], generatedKey);
    yield put(setGeneratedRecoveryKey(null));
    yield call(getBackup);
    yield put(setBackupStage(BackupStage.Success));
    yield put(setSuccessMessage('Account backup successful'));
    yield put(setErrorMessage(''));
  } catch {
    yield put(setErrorMessage('Account backup failed'));
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
    yield put(setBackupStage(BackupStage.Success));
    yield put(setSuccessMessage('Login successfully verified!'));
  } catch (e) {
    yield put(setErrorMessage('Failed to restore backup: Check your recovery key and try again'));
  }
}

export function* clearBackupState() {
  yield put(setLoaded(false));
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

export function* ensureUserHasBackup() {
  const backup = yield call(getSecureBackup);
  if (!backup?.backupInfo) {
    if (yield call(performUnlessLogout, delay(10000))) {
      yield call(systemInitiatedBackupDialog);
    }
  }
}

export function* closeBackupDialog() {
  yield put(setIsBackupDialogOpen(false));
}

export function* userInitiatedBackupDialog() {
  const { backupExists, backupRestored } = yield select((state) => state.matrix);

  if (!backupExists) {
    yield put(setBackupStage(BackupStage.UserGeneratePrompt));
  } else if (!backupRestored) {
    yield put(setBackupStage(BackupStage.UserRestorePrompt));
  } else {
    yield put(setBackupStage(BackupStage.RecoveredBackupInfo));
  }

  yield put(setIsBackupDialogOpen(true));
}

function* listenForUserLogout() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogout);
    yield call(updateTrustInfo, null);
  }
}

function* listenForUserLogin() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogin);
    yield call(handleBackupUserPrompts);
  }
}

export function* handleBackupUserPrompts() {
  const doneLoading = yield call(waitForChatConnectionCompletion);
  if (!doneLoading) {
    return;
  }

  const trustInfo = yield call(getBackup);
  if (!trustInfo) {
    return yield call(performUnlessLogout, call(checkBackupOnFirstSentMessage));
  }

  if (isBackupRestored(trustInfo)) {
    return;
  }

  yield call(systemInitiatedBackupDialog);
}

export function* systemInitiatedBackupDialog() {
  const { backupExists, backupRestored } = yield select((state) => state.matrix);

  if (!backupExists) {
    yield put(setBackupStage(BackupStage.SystemGeneratePrompt));
  } else if (!backupRestored) {
    yield put(setBackupStage(BackupStage.SystemRestorePrompt));
  } else {
    // Probably never trigger this stage by the system but keep it as a default case
    yield put(setBackupStage(BackupStage.RecoveredBackupInfo));
  }

  yield put(setIsBackupDialogOpen(true));
}

function isBackupRestored(trustInfo: any) {
  return Boolean(trustInfo?.usable || trustInfo?.trustedLocally);
}

export function* checkBackupOnFirstSentMessage() {
  const bus = yield call(getChatMessageBus);
  yield take(bus, ChatMessageEvents.Sent);
  yield call(ensureUserHasBackup);
}
