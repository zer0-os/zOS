import { call, delay, put, select, spawn, take, takeLatest } from 'redux-saga/effects';

import {
  SagaActionTypes,
  setGeneratedRecoveryKey,
  setDeviceId,
  setErrorMessage,
  setLoaded,
  setSuccessMessage,
  setTrustInfo,
  setIsBackupDialogOpen,
  setBackupStage,
  BackupStage,
} from '.';
import { chat, getSecureBackup } from '../../lib/chat';
import { performUnlessLogout } from '../utils';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { ChatMessageEvents, getChatMessageBus } from '../messages/messages';
import { waitForChatConnectionCompletion } from '../chat/saga';

export function* saga() {
  yield spawn(listenForUserLogin);

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
  yield takeLatest(SagaActionTypes.OpenBackupDialog, openBackupDialog);
  yield takeLatest(SagaActionTypes.CloseBackupDialog, closeBackupDialog);
  yield takeLatest(SagaActionTypes.VerifyKey, onVerifyKey);
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

  yield put(setTrustInfo(trustInfo));
  yield put(setLoaded(true));
  return trustInfo;
}

export function* generateBackup() {
  yield put(setBackupStage(BackupStage.GenerateBackup));
  const chatClient = yield call(chat.get);

  try {
    const key = yield call([chatClient, chatClient.generateSecureBackup]);
    yield put(setGeneratedRecoveryKey(key));
  } catch (error) {
    yield put(setErrorMessage('Failed to generate backup key. Please try again.'));
    yield put(setBackupStage(BackupStage.None));
  }
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
    yield put(setBackupStage(BackupStage.Success));
    yield put(setSuccessMessage('Account backup successful'));
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
  yield put(setTrustInfo(null));
  yield put(setGeneratedRecoveryKey(null));
  yield put(setSuccessMessage(''));
  yield put(setErrorMessage(''));
  yield put(setBackupStage(BackupStage.None));
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
      yield put(setBackupStage(BackupStage.SystemPrompt));
      yield put(setIsBackupDialogOpen(true));
    }
  }
}

export function* closeBackupDialog() {
  yield put(setIsBackupDialogOpen(false));
}

export function* openBackupDialog() {
  yield put(setIsBackupDialogOpen(true));
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

  yield put(setBackupStage(BackupStage.SystemPrompt));
  yield put(setIsBackupDialogOpen(true));
}

function isBackupRestored(trustInfo: any) {
  return trustInfo?.usable && trustInfo?.trustedLocally;
}

export function* checkBackupOnFirstSentMessage() {
  const bus = yield call(getChatMessageBus);
  yield take(bus, ChatMessageEvents.Sent);
  yield call(ensureUserHasBackup);
}

export function* onVerifyKey() {
  yield put(setBackupStage(BackupStage.RestoreBackup));
}
