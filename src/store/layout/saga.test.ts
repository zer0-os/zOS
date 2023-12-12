import { expectSaga } from 'redux-saga-test-plan';
import { when } from 'jest-when';

import {
  updateSidekick as updateSidekickSaga,
  initializeUserLayout,
  clearUserLayout,
  enterFullScreenMessenger,
} from './saga';

import { reducer } from '.';
import { setactiveConversationId } from '../chat';
import { StoreBuilder } from '../test/store';
import { rootReducer } from '../reducer';

describe('layout saga', () => {
  const sidekickKey = 'user-id-isSidekickOpen';
  const state = {
    authentication: {
      user: {
        data: {
          id: 'user-id',
        },
      },
    },
    chat: { activeConversationId: 'channel-id' },
  };

  describe('updateSidekick', () => {
    it('should store sidekick', async () => {
      const { storeState } = await expectSaga(updateSidekickSaga, { payload: { isOpen: true } })
        .withReducer(reducer, state as any)
        .run();

      expect(storeState.value.isSidekickOpen).toBeTrue();
      expect(global.localStorage.setItem).toHaveBeenCalledWith(sidekickKey, true);
    });
  });

  describe('initializeUserLayout', () => {
    it('sets the sidekick to open when previous state was open', async () => {
      stubLocalStorageValue(sidekickKey, 'true');

      const { storeState } = await expectSaga(initializeUserLayout, user({ id: 'user-id' }))
        .withReducer(reducer, state as any)
        .run();

      expect(storeState.value.isSidekickOpen).toBeTrue();
    });

    it('sets the sidekick to closed when previous state was closed', async () => {
      stubLocalStorageValue(sidekickKey, 'false');

      const { storeState } = await expectSaga(initializeUserLayout, user({ id: 'user-id' }))
        .withReducer(reducer, state as any)
        .run();

      expect(storeState.value.isSidekickOpen).toBeFalse();
    });

    it('sets the sidekick to open when previous state is unknown', async () => {
      stubLocalStorageValue(sidekickKey, null);

      const { storeState } = await expectSaga(initializeUserLayout, user({ id: 'user-id' }))
        .withReducer(reducer, state as any)
        .run();

      expect(storeState.value.isSidekickOpen).toBeTrue();
    });

    it('sets the sidekick to open when previous state is not valid', async () => {
      stubLocalStorageValue(sidekickKey, 'garbage');

      const { storeState } = await expectSaga(initializeUserLayout, user({ id: 'user-id' }))
        .withReducer(reducer, state as any)
        .run();

      expect(storeState.value.isSidekickOpen).toBeTrue();
    });

    describe('isMessengerFullScreen', () => {
      it('sets the messenger to full screen if user is not a member of worlds', async () => {
        stubLocalStorageValue('fullScreenMessenger', 'false');
        const { storeState } = await expectSaga(initializeUserLayout, user({ isAMemberOfWorlds: false }))
          .withReducer(reducer, state as any)
          .run();

        expect(storeState.value.isMessengerFullScreen).toBeTrue();
      });

      it('enters full screen messenger, and opens the first conversation if activeConversationId is null', async () => {
        const initialState = new StoreBuilder().withConversationList({ id: 'first-channel-id' });

        const { storeState } = await expectSaga(enterFullScreenMessenger, {})
          .withReducer(rootReducer, initialState.build())
          .put(setactiveConversationId('first-channel-id'))
          .run();

        expect(storeState.layout.value.isMessengerFullScreen).toBeTrue();
      });
    });
  });

  describe('clearUserLayout', () => {
    it('sets sidekick to closed', async () => {
      const { storeState } = await expectSaga(clearUserLayout)
        .withReducer(reducer, state as any)
        .run();

      expect(storeState.value.isSidekickOpen).toBeFalse();
    });
  });
});

function stubLocalStorageValue(key: string, value: string | null) {
  global.localStorage.getItem = jest.fn();
  when(global.localStorage.getItem).calledWith(key).mockReturnValue(value);
}

function user(attrs) {
  return { id: 'user-id', isAMemberOfWorlds: false, ...attrs };
}
