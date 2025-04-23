import * as matchers from 'redux-saga-test-plan/matchers';

import { userLeftChannel } from './saga';

import { rootReducer } from '../reducer';
import { StoreBuilder } from '../test/store';
import { expectSaga } from '../../test/saga';
import { openFirstConversation } from '../channels/saga';
import { clearLastActiveConversation } from '../../lib/last-conversation';
import { allChannelsSelector } from '../channels/selectors';

describe('channels list saga', () => {
  describe(userLeftChannel, () => {
    it('Room is removed from list when the current user has left a room', async () => {
      const roomId = 'room-id';
      const initialState = new StoreBuilder()
        .withCurrentUser({ id: 'current-user-id', matrixId: 'matrix-id' })
        .withUsers({ userId: 'current-user-id', matrixId: 'matrix-id' })
        .withConversationList({ id: 'one-room' }, { id: roomId }, { id: 'other-room' });

      const { storeState } = await expectSaga(userLeftChannel, roomId, 'matrix-id')
        .withReducer(rootReducer, initialState.build())
        .run();

      const channels = allChannelsSelector(storeState);
      expect(channels).toHaveLength(2);
      expect(channels).not.toContainEqual({ id: roomId });
    });

    it('does not remove room if user is not the current user', async () => {
      const roomId = 'room-id';
      const userId = 'current-user-id';
      const channel = { id: roomId };
      const initialState = new StoreBuilder()
        .withCurrentUserId(userId)
        .withUsers({ userId, matrixId: 'matrix-id' })
        .withConversationList(channel);

      const { storeState } = await expectSaga(userLeftChannel, roomId, 'other-matrix-id')
        .withReducer(rootReducer, initialState.build())
        .run();

      const channels = allChannelsSelector(storeState);
      expect(channels).toHaveLength(1);
      expect(channels).toContainEqual(channel);
    });

    it('changes active conversation if user leaves (is removed from) the currently active one', async () => {
      const roomId = 'conversation-id';
      const userId = 'user-id';

      const initialState = new StoreBuilder()
        .withCurrentUser({ id: userId, matrixId: 'matrix-id' })
        .withUsers({ userId, matrixId: 'matrix-id' })
        .withConversationList(
          {
            id: 'conversation-1',
            lastMessage: { createdAt: 10000000 } as any,
            messages: [{ id: '1', createdAt: 10000000 }] as any,
          },
          { id: roomId },
          {
            id: 'conversation-2',
            lastMessage: { createdAt: 10000001 } as any,
            messages: [{ id: '2', createdAt: 10000001 }] as any,
          }
        )
        .withActiveConversation({ id: roomId })
        .build();

      await expectSaga(userLeftChannel, roomId, 'matrix-id')
        .provide([[matchers.call.fn(openFirstConversation), null]])
        .withReducer(rootReducer, initialState)
        .call(openFirstConversation)
        .run();
    });

    it('clears last active conversation when user leaves the active conversation', async () => {
      const roomId = 'conversation-id';
      const userId = 'user-id';

      const initialState = new StoreBuilder()
        .withCurrentUser({ id: userId, matrixId: 'matrix-id' })
        .withUsers({ userId, matrixId: 'matrix-id' })
        .withConversationList(
          {
            id: 'conversation-1',
            lastMessage: { createdAt: 10000000 } as any,
            messages: [{ id: '1', createdAt: 10000000 }] as any,
          },
          { id: roomId },
          {
            id: 'conversation-2',
            lastMessage: { createdAt: 10000001 } as any,
            messages: [{ id: '2', createdAt: 10000001 }] as any,
          }
        )
        .withActiveConversation({ id: roomId })
        .build();

      await expectSaga(userLeftChannel, roomId, 'matrix-id')
        .provide([
          [matchers.call.fn(openFirstConversation), null],
          [matchers.call.fn(clearLastActiveConversation), null],
        ])
        .withReducer(rootReducer, initialState)
        .call(clearLastActiveConversation)
        .call(openFirstConversation)
        .run();
    });
  });
});
