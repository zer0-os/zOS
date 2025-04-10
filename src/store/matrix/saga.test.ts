import { call, delay } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';

import { expectSaga, stubDelay } from '../../test/saga';
import { chat, getSecureBackup } from '../../lib/chat';
import {
  clearBackupState,
  closeCreateBackupDialog,
  closeRestoreBackupDialog,
  generateBackup,
  getBackup,
  ensureUserHasBackup,
  restoreBackup,
  saveBackup,
  handleBackupUserPrompts,
  checkBackupOnFirstSentMessage,
  receiveBackupData,
  userInitiatedCreateBackupDialog,
  proceedToVerifyCreatedKey,
  proceedToVerifyRestorationKey,
  systemInitiatedCreateBackupDialog,
  systemInitiatedRestoreBackupDialog,
  userInitiatedRestoreBackupDialog,
} from './saga';
import { performUnlessLogout } from '../utils';

import { rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';
import { StoreBuilder } from '../test/store';
import { waitForChatConnectionCompletion } from '../chat/saga';
import { CreateBackupStage, RestoreBackupStage, initialRestoreProgressState } from '.';

const chatClient = {
  generateSecureBackup: () => null,
  restoreSecureBackup: (_key, _progressCallback) => null,
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
      .provide([
        [
          call([chatClient, chatClient.generateSecureBackup]),
          { encodedPrivateKey: 'new key - encoded', privateKey: 'new key - private' },
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix.generatedRecoveryKey).toEqual('new key - encoded');
  });

  it('sets stage to GenerateBackup', async () => {
    const { storeState } = await subject(generateBackup)
      .provide([
        [
          call([chatClient, chatClient.generateSecureBackup]),
          { encodedPrivateKey: 'new key - encoded', privateKey: 'new key - private' },
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix.createBackupStage).toEqual(CreateBackupStage.GenerateBackup);
  });

  it('handles error during backup generation', async () => {
    const error = new Error('Failed to generate backup');
    const { storeState } = await subject(generateBackup)
      .provide([[call([chatClient, chatClient.generateSecureBackup]), throwError(error)]])
      .withReducer(rootReducer)
      .call(userInitiatedCreateBackupDialog)
      .run();

    expect(storeState.matrix.errorMessage).toEqual('Failed to generate backup key. Please try again.');
  });
});

describe(saveBackup, () => {
  describe('success', () => {
    function successSubject(userInputKeyPhrase) {
      const initialState = {
        matrix: {
          generatedRecoveryKey: 'generated-key',
        },
      };

      return subject(saveBackup, { payload: userInputKeyPhrase })
        .provide([
          [
            call([chatClient, chatClient.saveSecureBackup], 'generated-key'),
            { version: 1 },
          ],
        ])
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

    it('clears error message on success', async () => {
      const { storeState } = await successSubject('generated-key').run();

      expect(storeState.matrix.errorMessage).toEqual('');
    });
  });

  describe('failure', () => {
    it('sets a failure message', async () => {
      const initialState = {
        matrix: {
          generatedRecoveryKey: 'generated-key',
        },
      };

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
      expect(storeState.matrix.createBackupStage).not.toEqual(CreateBackupStage.Success);
    });
  });
});

describe(restoreBackup, () => {
  it('tries to restore a backup', async () => {
    await subject(restoreBackup, { payload: 'recovery-key' })
      .withReducer(rootReducer)
      .provide([[matchers.call.like({ context: chatClient, fn: chatClient.restoreSecureBackup }), undefined]])
      .run();
  });

  it('resets the state when restoring is successful', async () => {
    await subject(restoreBackup, { payload: 'recovery-key' })
      .provide([[matchers.call.like({ context: chatClient, fn: chatClient.restoreSecureBackup }), undefined]])
      .withReducer(rootReducer)
      .call(getBackup)
      .run();
  });

  it('sets success message and stage when restoring is successful', async () => {
    const { storeState } = await subject(restoreBackup, { payload: 'recovery-key' })
      .provide([[matchers.call.like({ context: chatClient, fn: chatClient.restoreSecureBackup }), undefined]])
      .withReducer(rootReducer)
      .call(getBackup)
      .run();

    expect(storeState.matrix.successMessage).toEqual('Login successfully verified!');
    expect(storeState.matrix.restoreBackupStage).toEqual(RestoreBackupStage.Success);
  });

  it('sets failure state if restoring fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
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
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});

describe(proceedToVerifyCreatedKey, () => {
  it('sets create backup stage to VerifyKeyPhrase ', async () => {
    const initialState = { matrix: { generatedRecoveryKey: 'existing-key' } };

    const { storeState } = await subject(proceedToVerifyCreatedKey)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.matrix.createBackupStage).toEqual(CreateBackupStage.VerifyKeyPhrase);
  });
});

describe(proceedToVerifyRestorationKey, () => {
  it('sets restore backup stage to RestoreBackup ', async () => {
    const initialState = { matrix: { generatedRecoveryKey: null } };

    const { storeState } = await subject(proceedToVerifyRestorationKey)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.matrix.restoreBackupStage).toEqual(RestoreBackupStage.RestoreBackup);
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
        createBackupStage: CreateBackupStage.SystemGeneratePrompt,
        restoreBackupStage: RestoreBackupStage.SystemRestorePrompt,
        restoreProgress: initialRestoreProgressState,
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
      createBackupStage: CreateBackupStage.SystemGeneratePrompt,
      restoreBackupStage: RestoreBackupStage.SystemRestorePrompt,
      restoreProgress: initialRestoreProgressState,
    });
  });
});

describe('secure backup status management', () => {
  describe(ensureUserHasBackup, () => {
    it('opens the create backup dialog if backup does not exist', async () => {
      const initialState = { matrix: { isCreateBackupDialogOpen: false } };

      await subject(ensureUserHasBackup)
        .withReducer(rootReducer, initialState as any)
        .provide([
          [call(getSecureBackup), undefined],
          stubDelay(5000),
          [call(systemInitiatedCreateBackupDialog), undefined],
        ])
        .call(systemInitiatedCreateBackupDialog)
        .run();
    });

    it('does not open the create backup dialog if backup exists', async () => {
      const initialState = { matrix: { isCreateBackupDialogOpen: false } };

      await subject(ensureUserHasBackup)
        .withReducer(rootReducer, initialState as any)
        .provide([
          [call(getSecureBackup), { backupInfo: {}, trustInfo: { trusted: true }, crossSigning: false }],
        ])
        .not.call(systemInitiatedCreateBackupDialog)
        .run();
    });

    it('does not open the create backup dialog if user logs out during wait period', async () => {
      const initialState = { matrix: { isCreateBackupDialogOpen: false } };

      await subject(ensureUserHasBackup)
        .withReducer(rootReducer, initialState as any)
        .provide([
          [call(getSecureBackup), undefined],
          [call(performUnlessLogout, delay(10000)), false],
        ])
        .not.call(systemInitiatedCreateBackupDialog)
        .run();
    });
  });

  describe(closeCreateBackupDialog, () => {
    it('closes the create backup dialog', async () => {
      const initialState = { matrix: { isCreateBackupDialogOpen: true } };

      const { storeState } = await subject(closeCreateBackupDialog)
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(storeState.matrix.isCreateBackupDialogOpen).toBe(false);
    });
  });

  describe(closeRestoreBackupDialog, () => {
    it('closes the restore backup dialog', async () => {
      const initialState = { matrix: { isRestoreBackupDialogOpen: true } };

      const { storeState } = await subject(closeRestoreBackupDialog)
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(storeState.matrix.isRestoreBackupDialogOpen).toBe(false);
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

  it('opens the restore backup dialog and sets stage if user has not restored their backup', async () => {
    await subject({
      crossSigning: true,
      trustInfo: { trusted: false },
    })
      .provide([[call(systemInitiatedRestoreBackupDialog), undefined]])
      .not.call(performUnlessLogout, call(checkBackupOnFirstSentMessage))
      .call(systemInitiatedRestoreBackupDialog)
      .run();
  });

  it('waits for first sent message if user does not have a backup', async () => {
    await subject(null)
      .call(performUnlessLogout, call(checkBackupOnFirstSentMessage))
      .not.call(systemInitiatedCreateBackupDialog)
      .run();
  });

  it('does nothing if backup is already set up for this session', async () => {
    await subject({
      crossSigning: true,
      trustInfo: { trusted: true },
    })
      .not.call(performUnlessLogout, call(checkBackupOnFirstSentMessage))
      .not.call(systemInitiatedCreateBackupDialog)
      .run();
  });
});

describe(systemInitiatedCreateBackupDialog, () => {
  it('opens the create backup dialog in SystemGeneratePrompt state if user has no backup', async () => {
    const state = new StoreBuilder().withoutBackup();
    const { storeState } = await subject(systemInitiatedCreateBackupDialog)
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.isCreateBackupDialogOpen).toBe(true);
    expect(storeState.matrix.createBackupStage).toBe(CreateBackupStage.SystemGeneratePrompt);
  });
});

describe(systemInitiatedRestoreBackupDialog, () => {
  it('opens the restore backup dialog in SystemRestorePrompt state if user has an unrestored backup', async () => {
    const state = new StoreBuilder().withUnrestoredBackup();
    const { storeState } = await subject(systemInitiatedRestoreBackupDialog)
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.isRestoreBackupDialogOpen).toBe(true);
    expect(storeState.matrix.restoreBackupStage).toBe(RestoreBackupStage.SystemRestorePrompt);
  });

  it('opens the restore backup dialog in RecoveredBackupInfo state if user has a restored backup', async () => {
    const state = new StoreBuilder().withRestoredBackup();
    const { storeState } = await subject(systemInitiatedRestoreBackupDialog)
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.isRestoreBackupDialogOpen).toBe(true);
    expect(storeState.matrix.restoreBackupStage).toBe(RestoreBackupStage.RecoveredBackupInfo);
  });
});

describe(userInitiatedCreateBackupDialog, () => {
  it('opens the create backup dialog in UserGeneratePrompt state if user has no backup', async () => {
    const state = new StoreBuilder().withoutBackup();
    const { storeState } = await subject(userInitiatedCreateBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isCreateBackupDialogOpen).toBe(true);
    expect(storeState.matrix.createBackupStage).toBe(CreateBackupStage.UserGeneratePrompt);
  });

  it('does not open the backup dialog if user has a restored backup', async () => {
    const state = new StoreBuilder().withRestoredBackup();
    const { storeState } = await subject(userInitiatedCreateBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isCreateBackupDialogOpen).toBe(false);
  });
});

describe(userInitiatedRestoreBackupDialog, () => {
  it('opens the restore backup dialog in UserRestorePrompt state if user has an unrestored backup', async () => {
    const state = new StoreBuilder().withUnrestoredBackup();
    const { storeState } = await subject(userInitiatedRestoreBackupDialog)
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.isRestoreBackupDialogOpen).toBe(true);
    expect(storeState.matrix.restoreBackupStage).toBe(RestoreBackupStage.UserRestorePrompt);
  });

  it('opens the restore backup dialog in RecoveredBackupInfo state if user has a restored backup', async () => {
    const state = new StoreBuilder().withRestoredBackup();
    const { storeState } = await subject(userInitiatedRestoreBackupDialog)
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.isRestoreBackupDialogOpen).toBe(true);
    expect(storeState.matrix.restoreBackupStage).toBe(RestoreBackupStage.RecoveredBackupInfo);
  });

  it('does not open the restore backup dialog if user has no backup', async () => {
    const state = new StoreBuilder().withoutBackup();
    const { storeState } = await subject(userInitiatedRestoreBackupDialog)
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.isRestoreBackupDialogOpen).toBe(false);
  });
});

describe(receiveBackupData, () => {
  it('sets metadata if backup exists but is not restored', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: false, backupRestored: true } });

    const { returnValue, storeState } = await subject(receiveBackupData, {
      crossSigning: true,
      trustInfo: { trusted: false, matchesDecryptionKey: false },
    })
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(true);
    expect(storeState.matrix.backupRestored).toBe(false);
    expect(returnValue).toEqual({ backupExists: true, backupRestored: false });
  });

  it('sets metadata if backup exists and is trusted', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: false, backupRestored: false } });

    const { returnValue, storeState } = await subject(receiveBackupData, {
      crossSigning: true,
      trustInfo: { trusted: true },
    })
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(true);
    expect(storeState.matrix.backupRestored).toBe(true);
    expect(returnValue).toEqual({ backupExists: true, backupRestored: true });
  });

  it('sets metadata if backup exists and is not trusted but matches the decryption key', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: true, backupRestored: false } });

    const { returnValue, storeState } = await subject(receiveBackupData, {
      crossSigning: true,
      trustInfo: { trusted: false, matchesDecryptionKey: true },
    })
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(true);
    expect(storeState.matrix.backupRestored).toBe(true);
    expect(returnValue).toEqual({ backupExists: true, backupRestored: true });
  });

  it('sets metadata if backup does not exist', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: true, backupRestored: true } });

    const { returnValue, storeState } = await subject(receiveBackupData, null)
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(false);
    expect(storeState.matrix.backupRestored).toBe(false);
    expect(returnValue).toEqual({ backupExists: false, backupRestored: false });
  });

  it('sets metadata if backup is a legacy backup (no crossSigning)', async () => {
    const state = new StoreBuilder().withOtherState({ matrix: { backupExists: true, backupRestored: true } });

    const { returnValue, storeState } = await subject(receiveBackupData, {
      crossSigning: false,
      trustInfo: { trusted: true },
    })
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.matrix.backupExists).toBe(false);
    expect(storeState.matrix.backupRestored).toBe(false);
    expect(returnValue).toEqual({ backupExists: false, backupRestored: false });
  });
});

function restoredBackupResponse({ trusted } = { trusted: true }): any {
  return { backupInfo: {}, trustInfo: { trusted }, crossSigning: true };
}
