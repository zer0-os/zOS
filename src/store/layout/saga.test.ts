import { expectSaga } from 'redux-saga-test-plan';
import { when } from 'jest-when';

import { initializeUserLayout } from './saga';

import { reducer } from '.';

describe('layout saga', () => {
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

  describe('initializeUserLayout', () => {
    describe('isMessengerFullScreen', () => {
      it('sets the messenger to full screen if user is not a member of worlds', async () => {
        stubLocalStorageValue('fullScreenMessenger', 'false');
        const { storeState } = await expectSaga(initializeUserLayout, user({ isAMemberOfWorlds: false }))
          .withReducer(reducer, state as any)
          .run();

        expect(storeState.value.isMessengerFullScreen).toBeTrue();
      });
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
