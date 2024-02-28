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
    const { returnValue, storeState } = await subject(getBackup)
      .provide([
        [
          call(getSecureBackup),
          { backupInfo: {}, trustInfo: { usable: true, trusted_locally: true }, isLegacy: true },
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix).toEqual(
      expect.objectContaining({
        generatedRecoveryKey: null,
        isLoaded: true,
        trustInfo: { usable: true, trustedLocally: true, isLegacy: true },
        successMessage: '',
        errorMessage: '',
      })
    );
    expect(returnValue).toEqual({ usable: true, trustedLocally: true, isLegacy: true });
  });

  it('clears the backup if none found', async () => {
    const { returnValue, storeState } = await subject(getBackup)
      .provide([[call(getSecureBackup), undefined]])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix).toEqual(
      expect.objectContaining({
        generatedRecoveryKey: null,
        isLoaded: true,
        trustInfo: null,
        successMessage: '',
        errorMessage: '',
      })
    );
    expect(returnValue).toBeNull();
  });

  it('clears the backup if backupInfo not found', async () => {
    const { returnValue, storeState } = await subject(getBackup)
      .provide([[call(getSecureBackup), { backupInfo: undefined }]])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix).toEqual(
      expect.objectContaining({
        generatedRecoveryKey: null,
        isLoaded: true,
        trustInfo: null,
        successMessage: '',
        errorMessage: '',
      })
    );
    expect(returnValue).toBeNull();
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
      .run();

    expect(storeState.matrix.errorMessage).toEqual('Failed to generate backup key. Please try again.');
    expect(storeState.matrix.backupStage).toEqual(BackupStage.None);
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
  it('clears the temporary state but keeps the trustInfo', async () => {
    const initialState = {
      matrix: {
        isLoaded: true,
        generatedRecoveryKey: 'a key',
        trustInfo: { trustData: 'here' },
        successMessage: 'Stuff happened',
        errorMessage: 'An error',
        backupStage: BackupStage.SystemPrompt,
      },
    };
    const { storeState } = await subject(clearBackupState)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.matrix).toEqual({
      generatedRecoveryKey: null,
      isLoaded: false,
      trustInfo: { trustData: 'here' },
      successMessage: '',
      errorMessage: '',
      backupStage: BackupStage.None,
    });
  });
});

describe('secure backup status management', () => {
  describe(ensureUserHasBackup, () => {
    it('opens the backup dialog and sets stage if backup does not exist', async () => {
      const initialState = { matrix: { isBackupDialogOpen: false } };

      const { storeState } = await subject(ensureUserHasBackup)
        .withReducer(rootReducer, initialState as any)
        .provide([[call(getSecureBackup), undefined], stubDelay(10000)])
        .run();

      expect(storeState.matrix.isBackupDialogOpen).toBe(true);
      expect(storeState.matrix.backupStage).toBe(BackupStage.SystemPrompt);
    });

    it('does not open the backup dialog if backup exists', async () => {
      const initialState = { matrix: { isBackupDialogOpen: false } };

      const { storeState } = await subject(ensureUserHasBackup)
        .withReducer(rootReducer, initialState as any)
        .provide([
          [
            call(getSecureBackup),
            { backupInfo: {}, trustInfo: { usable: true, trusted_locally: true }, isLegacy: true },
          ],
        ])
        .run();

      expect(storeState.matrix.isBackupDialogOpen).toBe(false);
    });

    it('does not open the backup if user logs out during wait period', async () => {
      const initialState = { matrix: { isBackupDialogOpen: false } };

      const { storeState } = await subject(ensureUserHasBackup)
        .withReducer(rootReducer, initialState as any)
        .provide([
          [call(getSecureBackup), undefined],
          [call(performUnlessLogout, delay(10000)), false],
        ])
        .run();

      expect(storeState.matrix.isBackupDialogOpen).toBe(false);
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
    const { storeState } = await subject(noBackupResponse())
      .call(performUnlessLogout, call(checkBackupOnFirstSentMessage))
      .run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(false);
  });

  it('does nothing if backup is already set up for this session', async () => {
    const { storeState } = await subject(restoredBackupResponse())
      .not.call(performUnlessLogout, call(checkBackupOnFirstSentMessage))
      .run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(false);
  });
});

describe(systemInitiatedBackupDialog, () => {
  it('opens the backup dialog in GeneratePrompt state if user has no backup', async () => {
    const state = new StoreBuilder().withoutBackup();
    const { storeState } = await subject(systemInitiatedBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(true);
    expect(storeState.matrix.backupStage).toBe(BackupStage.SystemGeneratePrompt);
  });

  it('opens the backup dialog and sets stage - deprecated', async () => {
    const state = new StoreBuilder().withUnverifiedBackup();
    const { storeState } = await subject(systemInitiatedBackupDialog).withReducer(rootReducer, state.build()).run();

    expect(storeState.matrix.isBackupDialogOpen).toBe(true);
    expect(storeState.matrix.backupStage).toBe(BackupStage.SystemPrompt);
  });
});

function noBackupResponse(): any {
  return { backupInfo: null };
}

function unrestoredBackupResponse(): any {
  return { backupInfo: {}, trustInfo: { usable: false, trusted_locally: false }, isLegacy: false };
}

function restoredBackupResponse(): any {
  return { backupInfo: {}, trustInfo: { usable: true, trusted_locally: true }, isLegacy: false };
}
