import { call, delay, put, select, spawn, take, takeLatest, cancel } from 'redux-saga/effects';
import { channel } from 'redux-saga';

import {
  SagaActionTypes,
  setGeneratedRecoveryKey,
  setDeviceId,
  setErrorMessage,
  setLoaded,
  setSuccessMessage,
  setIsCreateBackupDialogOpen,
  setIsRestoreBackupDialogOpen,
  setCreateBackupStage,
  setRestoreBackupStage,
  CreateBackupStage,
  RestoreBackupStage,
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
import Matrix from '../../lib/chat/matrix/matrix-client-instance';
import { batchedUpdateLastMessage } from '../messages/saga';
import { allChannelIdsSelector } from '../channels/selectors';

export function* saga() {
  yield spawn(listenForUserLogin);
  yield spawn(listenForUserLogout);

  yield takeLatest(SagaActionTypes.GetBackup, getBackup);
  yield takeLatest(SagaActionTypes.GenerateBackup, generateBackup);
  yield takeLatest(SagaActionTypes.SaveBackup, saveBackup);
  yield takeLatest(SagaActionTypes.RestoreBackup, restoreBackup);
  yield takeLatest(SagaActionTypes.ClearBackup, clearBackupState);
  yield takeLatest(SagaActionTypes.CloseCreateBackupDialog, closeCreateBackupDialog);
  yield takeLatest(SagaActionTypes.CloseRestoreBackupDialog, closeRestoreBackupDialog);
  yield takeLatest(SagaActionTypes.OpenCreateBackupDialog, userInitiatedCreateBackupDialog);
  yield takeLatest(SagaActionTypes.OpenRestoreBackupDialog, userInitiatedRestoreBackupDialog);
  yield takeLatest(SagaActionTypes.VerifyCreatedKey, proceedToVerifyCreatedKey);
  yield takeLatest(SagaActionTypes.VerifyRestorationKey, proceedToVerifyRestorationKey);

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
    // If the backup is trusted locally, or usable and matches the decryption key, then we consider it restored
    // There are cases when only two of the three are true but in either case
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
  yield put(setCreateBackupStage(CreateBackupStage.GenerateBackup));

  const chatClient = yield call(chat.get);

  try {
    const key: GeneratedSecretStorageKey = yield call([chatClient, chatClient.generateSecureBackup]);
    yield put(setGeneratedRecoveryKey(key.encodedPrivateKey));
  } catch (error) {
    yield put(setErrorMessage('Failed to generate backup key. Please try again.'));
    yield call(userInitiatedCreateBackupDialog);
  }
}

export function* proceedToVerifyCreatedKey() {
  yield put(setCreateBackupStage(CreateBackupStage.VerifyKeyPhrase));
}

export function* proceedToVerifyRestorationKey() {
  yield put(setRestoreBackupStage(RestoreBackupStage.RestoreBackup));
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
    yield put(setCreateBackupStage(CreateBackupStage.Success));
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
    yield put(setRestoreBackupStage(RestoreBackupStage.Success));
    yield put(setSuccessMessage('Login successfully verified!'));
    // Update the last message for all channels after decryption is complete
    const channelIds = yield select(allChannelIdsSelector);
    yield call(batchedUpdateLastMessage, channelIds);
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
      yield call(systemInitiatedCreateBackupDialog);
    }
  }
}

export function* closeCreateBackupDialog() {
  yield put(setIsCreateBackupDialogOpen(false));
}

export function* closeRestoreBackupDialog() {
  yield put(setIsRestoreBackupDialogOpen(false));
}

export function* userInitiatedCreateBackupDialog() {
  const { backupExists } = yield select((state) => state.matrix);

  if (!backupExists) {
    yield put(setCreateBackupStage(CreateBackupStage.UserGeneratePrompt));
    yield put(setIsCreateBackupDialogOpen(true));
  } else {
    yield put(setErrorMessage('A backup already exists. Please use the restore flow instead.'));
  }
}

export function* userInitiatedRestoreBackupDialog() {
  const { backupExists, backupRestored } = yield select((state) => state.matrix);

  if (backupExists) {
    if (!backupRestored) {
      yield put(setRestoreBackupStage(RestoreBackupStage.UserRestorePrompt));
      yield put(setIsRestoreBackupDialogOpen(true));
    } else {
      yield put(setRestoreBackupStage(RestoreBackupStage.RecoveredBackupInfo));
      yield put(setIsRestoreBackupDialogOpen(true));
    }
  } else {
    yield put(setErrorMessage('No backup exists to restore. Please create a backup first.'));
  }
}

function* listenForUserLogout() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogout);
    yield call(receiveBackupData, null);
    yield call(() => Matrix.resetClientInstance());
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

  try {
    const { backupExists, backupRestored } = yield call(getBackup);
    if (!backupExists) {
      return yield call(performUnlessLogout, call(checkBackupOnFirstSentMessage));
    }

    if (backupRestored) {
      return;
    }

    yield call(systemInitiatedRestoreBackupDialog);
  } catch (e) {
    console.error('Error handling backup user prompts:', e);
  }
}

export function* systemInitiatedCreateBackupDialog() {
  const { backupExists } = yield select((state) => state.matrix);

  if (!backupExists) {
    yield put(setCreateBackupStage(CreateBackupStage.SystemGeneratePrompt));
    yield put(setIsCreateBackupDialogOpen(true));
  }
}

export function* systemInitiatedRestoreBackupDialog() {
  const { backupExists, backupRestored } = yield select((state) => state.matrix);

  if (backupExists && !backupRestored) {
    yield put(setRestoreBackupStage(RestoreBackupStage.SystemRestorePrompt));
  } else if (backupExists && backupRestored) {
    yield put(setRestoreBackupStage(RestoreBackupStage.RecoveredBackupInfo));
  }

  yield put(setIsRestoreBackupDialogOpen(true));
}

export function* checkBackupOnFirstSentMessage() {
  const bus = yield call(getChatMessageBus);
  yield take(bus, ChatMessageEvents.Sent);
  yield call(ensureUserHasBackup);
}
