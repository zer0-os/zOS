import { call, delay, put, select, spawn, take, takeLatest, cancel } from 'redux-saga/effects';
import { channel } from 'redux-saga';

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
  setRestoreProgress,
  initialRestoreProgressState,
} from '.';
import { chat, getSecureBackup } from '../../lib/chat';
import { performUnlessLogout } from '../utils';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';
import { ChatMessageEvents, getChatMessageBus } from '../messages/messages';
import { waitForChatConnectionCompletion } from '../chat/saga';
import * as Sentry from '@sentry/browser';
import type { MatrixKeyBackupInfo } from '../../lib/chat/types';
import { GeneratedSecretStorageKey } from 'matrix-js-sdk/lib/crypto-api';

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
}

export function* getBackup() {
  yield put(setLoaded(false));

  const existingBackup = yield call(getSecureBackup);
  const backupState = yield call(receiveBackupData, existingBackup);
  yield put(setLoaded(true));

  return backupState;
}

export function* receiveBackupData(existingBackup: MatrixKeyBackupInfo | null) {
  let backupExists = false;
  let backupRestored = false;

  if (!existingBackup?.crossSigning) {
    // We used to have historical backups that didn't use cross-signing
    // If a user happens to have that then we treat them as if they don't have a backup
    // Otherwise, carry on as normal
    backupExists = false;
    backupRestored = false;
  } else {
    backupExists = !!existingBackup?.trustInfo;
    // If the backup is trusted locally, usable, or matches the decryption key, then we consider it restored
    // There are cases when only one of the two is true but in either case
    // we've found the backup is sufficient to decrypt everything
    backupRestored =
      backupExists && (existingBackup.trustInfo.trusted || existingBackup.trustInfo.matchesDecryptionKey);
  }

  yield put(setBackupExists(backupExists));
  yield put(setBackupRestored(backupRestored));

  return { backupExists, backupRestored };
}

export function* generateBackup() {
  yield put(setErrorMessage(''));
  yield put(setBackupStage(BackupStage.GenerateBackup));

  const chatClient = yield call(chat.get);

  try {
    const key: GeneratedSecretStorageKey = yield call([chatClient, chatClient.generateSecureBackup]);
    yield put(setGeneratedRecoveryKey(key.encodedPrivateKey));
  } catch (error) {
    yield put(setErrorMessage('Failed to generate backup key. Please try again.'));
    yield call(userInitiatedBackupDialog);
  }
}

export function* proceedToVerifyKey() {
  const existingKey: string | null = yield select((state) => state.matrix.generatedRecoveryKey);

  if (existingKey) {
    yield put(setBackupStage(BackupStage.VerifyKeyPhrase));
  } else {
    yield put(setBackupStage(BackupStage.RestoreBackup));
  }
}

export function* saveBackup(action) {
  yield put(setSuccessMessage(''));
  yield put(setErrorMessage(''));
  const generatedKey: string | null = yield select((state) => state.matrix.generatedRecoveryKey);
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
  yield put(setRestoreProgress({ ...initialRestoreProgressState, stage: 'start' }));

  const chatClient = yield call(chat.get);
  const recoveryKey = action.payload;
  const progressChannel = channel();

  try {
    const restorePromise = call([chatClient, chatClient.restoreSecureBackup], recoveryKey, (progress) =>
      progressChannel.put(progress)
    );

    const progressTask = yield spawn(function* () {
      while (true) {
        yield put(setRestoreProgress(yield take(progressChannel)));
      }
    });

    yield restorePromise;
    progressChannel.close();
    yield cancel(progressTask);

    yield call(getBackup);
    yield put(setBackupStage(BackupStage.Success));
    yield put(setSuccessMessage('Login successfully verified!'));
  } catch (e: any) {
    Sentry.captureException(e, {
      extra: {
        context: 'restoreBackup',
        userId: chatClient.userId,
        keyLength: recoveryKey.length,
      },
    });
    console.error('Backup restoration failed:', {
      errorName: e.name,
      errorMessage: e.message,
      errorStack: e.stack,
      keyLength: recoveryKey.length,
    });

    yield put(setErrorMessage('Failed to restore backup: Check your recovery key and try again'));
  }
}

export function* clearBackupState() {
  yield put(setLoaded(false));
  yield put(setGeneratedRecoveryKey(null));
  yield put(setSuccessMessage(''));
  yield put(setErrorMessage(''));
  yield put(setRestoreProgress(initialRestoreProgressState));
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

export function* ensureUserHasBackup() {
  const backup = yield call(getSecureBackup);
  if (!backup) {
    if (yield call(performUnlessLogout, delay(5000))) {
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
    yield call(receiveBackupData, null);
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

  const { backupExists, backupRestored } = yield call(getBackup);
  if (!backupExists) {
    return yield call(performUnlessLogout, call(checkBackupOnFirstSentMessage));
  }

  if (backupRestored) {
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

export function* checkBackupOnFirstSentMessage() {
  const bus = yield call(getChatMessageBus);
  yield take(bus, ChatMessageEvents.Sent);
  yield call(ensureUserHasBackup);
}
