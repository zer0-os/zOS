import { call, delay } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';

import { expectSaga, stubDelay } from '../../test/saga';
import { chat, getSecureBackup } from '../../lib/chat';
import {
  clearBackupState,
  closeBackupDialog,
  generateBackup,
  getBackup,
  ensureUserHasBackup,
  restoreBackup,
  proceedToVerifyKey,
  saveBackup,
  handleBackupUserPrompts,
  checkBackupOnFirstSentMessage,
  systemInitiatedBackupDialog,
  userInitiatedBackupDialog,
  receiveBackupData,
} from './saga';
import { performUnlessLogout } from '../utils';

import { rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';
import { StoreBuilder } from '../test/store';
import { waitForChatConnectionCompletion } from '../chat/saga';
import { BackupStage } from '.';

const chatClient = {
  generateSecureBackup: () => null,
  restoreSecureBackup: (_key) => null,
  saveSecureBackup: (_backup) => null,
};

function subject(...args: Parameters<typeof expectSaga>) {
  return expectSaga(...args).provide([
    [matchers.call.fn(chat.get), chatClient],
    [matchers.call.fn(getSecureBackup), true],
  ]);
}

describe(getBackup, () => {
  it('fetches the existing backup', async () => {
    const { returnValue } = await subject(getBackup)
      .provide([
        [call(getSecureBackup), restoredBackupResponse()],
      ])
      .withReducer(rootReducer)
      .call(receiveBackupData, restoredBackupResponse())
      .run();

    expect(returnValue).toEqual({ backupExists: true, backupRestored: true });
  });

  it('clears the backup if none found', async () => {
    const { returnValue } = await subject(getBackup)
      .provide([[call(getSecureBackup), undefined]])
      .withReducer(rootReducer)
      .run();

    expect(returnValue).toEqual({ backupExists: false, backupRestored: false });
  });

  it('clears the backup if trustInfo not found', async () => {
    const { returnValue } = await subject(getBackup)
      .provide([[call(getSecureBackup), { trustInfo: undefined }]])
      .withReducer(rootReducer)
      .call(receiveBackupData, { trustInfo: undefined })
      .run();

    expect(returnValue).toEqual({ backupExists: false, backupRestored: false });
  });
});

describe(generateBackup, () => {
  it('generates a new backup', async () => {
    const { storeState } = await subject(generateBackup)
      .provide([[call([chatClient, chatClient.generateSecureBackup]), 'new key']])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix.generatedRecoveryKey).toEqual('new key');
  });

  it('sets stage to GenerateBackup', async () => {
    const { storeState } = await subject(generateBackup)
      .provide([[call([chatClient, chatClient.generateSecureBackup]), 'new key']])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix.backupStage).toEqual(BackupStage.GenerateBackup);
  });

  it('handles error during backup generation', async () => {
    const error = new Error('Failed to generate backup');
    const { storeState } = await subject(generateBackup)
      .provide([[call([chatClient, chatClient.generateSecureBackup]), throwError(error)]])
      .withReducer(rootReducer)
      .call(userInitiatedBackupDialog)
      .run();

    expect(storeState.matrix.errorMessage).toEqual('Failed to generate backup key. Please try again.');
  });

  it('reuses existing backup key if present and does not call generateSecureBackup', async () => {
    const initialState = { matrix: { generatedRecoveryKey: 'existing-key' } };
    const generateSecureBackupMock = jest.fn();

    const { storeState } = await subject(generateBackup)
      .withReducer(rootReducer, initialState as any)
      .provide([
        [matchers.call.fn(chat.get), { ...chatClient, generateSecureBackup: generateSecureBackupMock }],
        [matchers.call.fn(getSecureBackup), true],
      ])
      .run();

    expect(storeState.matrix.generatedRecoveryKey).toEqual('existing-key');
    expect(generateSecureBackupMock).not.toHaveBeenCalled();
  });
});

describe(saveBackup, () => {
  describe('success', () => {
    function successSubject(userInputKeyPhrase) {
      const initialState = { matrix: { generatedRecoveryKey: 'generated-key' } };

      return subject(saveBackup, { payload: userInputKeyPhrase })
        .provide([[call([chatClient, chatClient.saveSecureBackup], 'generated-key'), { version: 1 }]])
        .withReducer(rootReducer, initialState as any);
    }
    it('clears the generated backup', async () => {
      const { storeState } = await successSubject('generated-key').run();

      expect(storeState.matrix.generatedRecoveryKey).toEqual(null);
    });

    it('fetches the saved backup', async () => {
      await successSubject('generated-key').call(getBackup).run();
    });

    it('sets a success message', async () => {
      const { storeState } = await successSubject('generated-key').run();

      expect(storeState.matrix.successMessage).toEqual('Account backup successful');
    });
  });

  describe('failure', () => {
    it('sets a failure message', async () => {
      const initialState = { matrix: { generatedRecoveryKey: 'generated-key' } };

      const { storeState } = await subject(saveBackup, { payload: 'generated-key' })
        .provide([
          [
            matchers.call.like({ context: chatClient, fn: chatClient.saveSecureBackup }),
            throwError(new Error('simulated error')),
          ],
        ])
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(storeState.matrix.errorMessage).toEqual('Account backup failed');
    });

    it('sets error message and aborts if user input key phrase does not match the generated key', async () => {
      const initialState = { matrix: { generatedRecoveryKey: 'generated-key' } };

      const { storeState } = await subject(saveBackup, { payload: 'user-input-wrong-key' })
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(storeState.matrix.errorMessage).toEqual(
        'The phrase you entered does not match. Backup phrases are case sensitive'
      );
      expect(storeState.matrix.backupStage).not.toEqual(BackupStage.Success);
    });
  });
});

describe(restoreBackup, () => {
  it('tries to restore a backup', async () => {
    await subject(restoreBackup, { payload: 'recovery-key' })
      .withReducer(rootReducer)
      .call([chatClient, chatClient.restoreSecureBackup], 'recovery-key')
      .run();
  });

  it('resets the state when restoring is successsful', async () => {
    await subject(restoreBackup, { payload: 'recovery-key' })
      .provide([[call([chatClient, chatClient.restoreSecureBackup], 'recovery-key'), undefined]])
      .withReducer(rootReducer)
      .call(getBackup)
      .run();
  });

  it('sets success message and stage when restoring is successful', async () => {
    const { storeState } = await subject(restoreBackup, { payload: 'recovery-key' })
      .provide([[call([chatClient, chatClient.restoreSecureBackup], 'recovery-key'), undefined]])
      .withReducer(rootReducer)
      .call(getBackup)
      .run();

    expect(storeState.matrix.successMessage).toEqual('Login successfully verified!');
    expect(storeState.matrix.backupStage).toEqual(BackupStage.Success);
  });

  it('sets failure state if restoring fails', async () => {
    const { storeState } = await subject(restoreBackup, { payload: 'recovery-key' })
      .provide([
        [
          matchers.call.like({ context: chatClient, fn: chatClient.restoreSecureBackup }),
          throwError(new Error('simulated error')),
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix.errorMessage).toEqual('Failed to restore backup: Check your recovery key and try again');
  });
});

describe(proceedToVerifyKey, () => {
  it('sets stage to RestoreBackup when no existing key is found', async () => {
    const initialState = { matrix: { generatedRecoveryKey: null } };
    const { storeState } = await subject(proceedToVerifyKey)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.matrix.backupStage).toEqual(BackupStage.RestoreBackup);
  });

  it('sets stage to VerifyKeyPhrase when existing key is found', async () => {
    const initialState = { matrix: { generatedRecoveryKey: 'existing-key' } };

    const { storeState } = await subject(proceedToVerifyKey)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.matrix.backupStage).toEqual(BackupStage.VerifyKeyPhrase);
  });
});

describe(clearBackupState, () => {
  it('clears the temporary state but keeps the stage', async () => {
    const initialState = {
      matrix: {
        isLoaded: true,
        generatedRecoveryKey: 'a key',
        successMessage: 'Stuff happened',
        errorMessage: 'An error',
        backupStage: BackupStage.SystemGeneratePrompt,
      },
    };
    const { storeState } = await subject(clearBackupState)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.matrix).toEqual({
      generatedRecoveryKey: null,
      isLoaded: false,
      successMessage: '',
      errorMessage: '',
      backupStage: BackupStage.SystemGeneratePrompt,
    });
  });
});

describe('secure backup status management', () => {
  describe(ensureUserHasBackup, () => {
    it('opens the backup dialog if backup does not exist', async () => {
      const initialState = { matrix: { isBackupDialogOpen: false } };

      await subject(ensureUserHasBackup)
        .withReducer(rootReducer, initialState as any)
        .provide([
          [call(getSecureBackup), undefined],
          stubDelay(10000),
          [call(systemInitiatedBackupDialog), undefined],
        ])
        .call(systemInitiatedBackupDialog)
        .run();
    });

    it('does not open the backup dialog if backup exists', async () => {
      const initialState = { matrix: { isBackupDialogOpen: false } };

      await subject(ensureUserHasBackup)
        .withReducer(rootReducer, initialState as any)
        .provide([
          [
            call(getSecureBackup),
            { backupInfo: {}, trustInfo: { usable: true, trusted_locally: true }, isLegacy: true },
          ],
        ])
        .not.call(systemInitiatedBackupDialog)
        .run();
    });

    it('does not open the backup if user logs out during wait period', async () => {
      const initialState = { matrix: { isBackupDialogOpen: false } };

      await subject(ensureUserHasBackup)
        .withReducer(rootReducer, initialState as any)
        .provide([
          [call(getSecureBackup), undefined],
          [call(performUnlessLogout, delay(10000)), false],
        ])
        .not.call(systemInitiatedBackupDialog)
        .run();
    });
  });

  describe(closeBackupDialog, () => {
    it('closes the backup dialog and sets stage', async () => {
      const initialState = {
        matrix: {
          isBackupDialogOpen: true,
        },
      };

      const { storeState } = await subject(closeBackupDialog)
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(storeState.matrix.isBackupDialogOpen).toBe(false);
    });
  });
});

describe(handleBackupUserPrompts, () => {
  function subject(getBackupResponse) {
    return expectSaga(handleBackupUserPrompts)
      .provide([
        [matchers.call.fn(waitForChatConnectionCompletion), true],
        [call(getSecureBackup), getBackupResponse],
      ])
      .withReducer(rootReducer, new StoreBuilder().build());
  }

  it('opens the backup dialog and sets stage if user has not restored their backup', async () => {
    await subject(unrestoredBackupResponse())
      .provide([[call(systemInitiatedBackupDialog), undefined]])
      .not.call(performUnlessLogout, call(checkBackupOnFirstSentMessage))
      .call(systemInitiatedBackupDialog)
      .run();
  });

  it('waits for first sent message if user does not have a backup', async () => {
    await subject(noBackupResponse())
      .call(performUnlessLogout, call(checkBackupOnFirstSentMessage))
      .not.call(systemInitiatedBackupDialog)
      .run();
  });

  it('does nothing if backup is already set up for this session', async () => {
    await subject(restoredBackupResponse())
      .not.call(performUnlessLogout, call(checkBackupOnFirstSentMessage))
      .not.call(systemInitiatedBackupDialog)
      .run();
  });
});

describe(systemInitiatedBackupDialog, () => {
  it('opens the backup dialog in SystemGeneratePrompt state if user has no backup', async () => {
    const state = new StoreBuilder().withoutBackup();
    const { storeState } = await subject(systemInitiatedBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(true);
    expect(storeState.matrix.backupStage).toBe(BackupStage.SystemGeneratePrompt);
  });

  it('opens the backup dialog in SystemRestorePrompt state if user has an unrestored backup', async () => {
    const state = new StoreBuilder().withUnrestoredBackup();
    const { storeState } = await subject(systemInitiatedBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(true);
    expect(storeState.matrix.backupStage).toBe(BackupStage.SystemRestorePrompt);
  });

  it('opens the backup dialog in RecoveredBackupInfo state if user has a restored backup - default but probably should not happen', async () => {
    const state = new StoreBuilder().withRestoredBackup();
    const { storeState } = await subject(systemInitiatedBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(true);
    expect(storeState.matrix.backupStage).toBe(BackupStage.RecoveredBackupInfo);
  });
});

describe(userInitiatedBackupDialog, () => {
  it('opens the backup dialog in UserGeneratePrompt state if user has no backup', async () => {
    const state = new StoreBuilder().withoutBackup();
    const { storeState } = await subject(userInitiatedBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(true);
    expect(storeState.matrix.backupStage).toBe(BackupStage.UserGeneratePrompt);
  });

  it('opens the backup dialog in UserRestorePrompt state if user has an unrestored backup', async () => {
    const state = new StoreBuilder().withUnrestoredBackup();
    const { storeState } = await subject(userInitiatedBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(true);
    expect(storeState.matrix.backupStage).toBe(BackupStage.UserRestorePrompt);
  });

  it('opens the backup dialog in RecoveredBackupInfo state if user has a restored backup - default but probably should not happen', async () => {
    const state = new StoreBuilder().withRestoredBackup();
    const { storeState } = await subject(userInitiatedBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(true);
    expect(storeState.matrix.backupStage).toBe(BackupStage.RecoveredBackupInfo);
  });
});

describe(receiveBackupData, () => {
  it('sets metadata if backup exists but is not restored', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: false, backupRestored: true } });

    const { returnValue, storeState } = await subject(receiveBackupData, unrestoredBackupResponse())
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(true);
    expect(storeState.matrix.backupRestored).toBe(false);
    expect(returnValue).toEqual({ backupExists: true, backupRestored: false });
  });

  it('sets metadata if backup exists and is usable', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: false, backupRestored: false } });

    const { returnValue, storeState } = await subject(
      receiveBackupData,
      restoredBackupResponse({ usable: true, trusted_locally: false })
    )
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(true);
    expect(storeState.matrix.backupRestored).toBe(true);
    expect(returnValue).toEqual({ backupExists: true, backupRestored: true });
  });

  it('sets metadata if backup exists and is trusted locally', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: false, backupRestored: false } });

    const { returnValue, storeState } = await subject(
      receiveBackupData,
      restoredBackupResponse({ usable: false, trusted_locally: true })
    )
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(true);
    expect(storeState.matrix.backupRestored).toBe(true);
    expect(returnValue).toEqual({ backupExists: true, backupRestored: true });
  });

  it('sets metadata if backup does not exist', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: true, backupRestored: true } });

    const { returnValue, storeState } = await subject(receiveBackupData, { trustedInfo: null })
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(false);
    expect(storeState.matrix.backupRestored).toBe(false);
    expect(returnValue).toEqual({ backupExists: false, backupRestored: false });
  });

  it('sets metadata if backup is a legacy backup', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: true, backupRestored: true } });

    const backupResponse = unrestoredBackupResponse();
    backupResponse.isLegacy = true;
    const { returnValue, storeState } = await subject(receiveBackupData, backupResponse)
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(false);
    expect(storeState.matrix.backupRestored).toBe(false);
    expect(returnValue).toEqual({ backupExists: false, backupRestored: false });
  });
});

function noBackupResponse(): any {
  return { backupInfo: null };
}

function unrestoredBackupResponse(): any {
  return { backupInfo: {}, trustInfo: { usable: false, trusted_locally: false }, isLegacy: false };
}

function restoredBackupResponse({ usable, trusted_locally } = { usable: true, trusted_locally: true }): any {
  return { backupInfo: {}, trustInfo: { usable, trusted_locally }, isLegacy: false };
}
