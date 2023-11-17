import { call } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';

import { expectSaga } from '../../test/saga';
import { chat } from '../../lib/chat';
import { clearBackupState, generateBackup, getBackup, restoreBackup, saveBackup } from './saga';

import { rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';

const chatClient = {
  getSecureBackup: () => null,
  generateSecureBackup: () => null,
  restoreSecureBackup: (_key) => null,
  saveSecureBackup: (_backup) => null,
};

function subject(...args: Parameters<typeof expectSaga>) {
  return expectSaga(...args).provide([
    [matchers.call.fn(chat.get), chatClient],
  ]);
}

describe(getBackup, () => {
  it('fetches the existing backup', async () => {
    const { storeState } = await subject(getBackup)
      .provide([
        [
          call([chatClient, chatClient.getSecureBackup]),
          { backupInfo: {}, trustInfo: { usable: true, trusted_locally: true } },
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix).toEqual(
      expect.objectContaining({
        backup: null,
        isLoaded: true,
        trustInfo: { usable: true, trustedLocally: true },
        successMessage: '',
        errorMessage: '',
      })
    );
  });

  it('clears the backup if none found', async () => {
    const { storeState } = await subject(getBackup)
      .provide([[call([chatClient, chatClient.getSecureBackup]), undefined]])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix).toEqual(
      expect.objectContaining({
        backup: null,
        isLoaded: true,
        trustInfo: null,
        successMessage: '',
        errorMessage: '',
      })
    );
  });

  it('clears the backup if backupInfo not found', async () => {
    const { storeState } = await subject(getBackup)
      .provide([[call([chatClient, chatClient.getSecureBackup]), { backupInfo: undefined }]])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix).toEqual(
      expect.objectContaining({
        backup: null,
        isLoaded: true,
        trustInfo: null,
        successMessage: '',
        errorMessage: '',
      })
    );
  });
});

describe(generateBackup, () => {
  it('generates a new backup', async () => {
    const { storeState } = await subject(generateBackup)
      .provide([[call([chatClient, chatClient.generateSecureBackup]), { data: 'here' }]])
      .withReducer(rootReducer)
      .run();

    expect(storeState.matrix.backup).toEqual({ data: 'here' });
  });
});

describe(saveBackup, () => {
  describe('success', () => {
    function successSubject() {
      const initialState = { matrix: { backup: { generated: 'backup' } } };

      return subject(saveBackup)
        .provide([[call([chatClient, chatClient.saveSecureBackup], { generated: 'backup' }), { version: 1 }]])
        .withReducer(rootReducer, initialState as any);
    }
    it('clears the generated backup', async () => {
      const { storeState } = await successSubject().run();

      expect(storeState.matrix.backup).toEqual(null);
    });

    it('fetches the saved backup', async () => {
      await successSubject().call(getBackup).run();
    });

    it('sets a success message', async () => {
      const { storeState } = await successSubject().run();

      expect(storeState.matrix.successMessage).toEqual('Backup saved successfully');
    });
  });

  describe('failure', () => {
    it('sets a failure message', async () => {
      const initialState = { matrix: { backup: {} } };

      const { storeState } = await subject(saveBackup)
        .provide([
          [
            matchers.call.like({ context: chatClient, fn: chatClient.saveSecureBackup }),
            throwError(new Error('simulated error')),
          ],
        ])
        .withReducer(rootReducer, initialState as any)
        .run();

      expect(storeState.matrix.errorMessage).toEqual('Backup save failed');
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

  it('sets success message when restoring is successful', async () => {
    const { storeState } = await subject(restoreBackup, { payload: 'recovery-key' })
      .provide([[call([chatClient, chatClient.restoreSecureBackup], 'recovery-key'), undefined]])
      .withReducer(rootReducer)
      .call(getBackup)
      .run();

    expect(storeState.matrix.successMessage).toEqual('Backup restored successfully');
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

describe(clearBackupState, () => {
  it('clears the state', async () => {
    const initialState = {
      matrix: {
        isLoaded: true,
        backup: { data: 'here' },
        trustInfo: { trustData: 'here' },
        successMessage: 'Stuff happened',
        errorMessage: 'An error',
      },
    };
    const { storeState } = await subject(clearBackupState)
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(storeState.matrix).toEqual({
      backup: null,
      isLoaded: false,
      trustInfo: null,
      successMessage: '',
      errorMessage: '',
    });
  });
});
