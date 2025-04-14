import { call } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  clearChannelsAndConversations,
  userLeftChannel,
  addChannel,
  otherUserJoinedChannel,
  otherUserLeftChannel,
} from './saga';

import { rootReducer } from '../reducer';
import { denormalize as denormalizeChannel } from '../channels';
import { StoreBuilder } from '../test/store';
import { expectSaga } from '../../test/saga';
import { openFirstConversation } from '../channels/saga';
import { clearLastActiveConversation } from '../../lib/last-conversation';
import { getUserByMatrixId } from '../users/saga';

const mockConversation = (id: string) => ({
  id: `conversation_${id}`,
  name: `conversation ${id}`,
  icon: 'conversation-icon',
  messages: [
    { isAdmin: true, admin: { userId: 'admin-id-1' } },
    { sender: { userId: 'user-id-1' } },
  ],
});

const MOCK_CONVERSATIONS = [mockConversation('0001'), mockConversation('0002')];

const chatClient = {
  getConversations: () => MOCK_CONVERSATIONS,
};

// Refactor as this works differently now

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

      expect(storeState.channelsList.value).toHaveLength(2);
      expect(storeState.channelsList.value).not.toContain(roomId);
    });

    it('does not remove room if user is not the current user', async () => {
      const roomId = 'room-id';
      const userId = 'current-user-id';
      const initialState = new StoreBuilder()
        .withCurrentUserId(userId)
        .withUsers({ userId, matrixId: 'matrix-id' })
        .withConversationList({ id: roomId });

      const { storeState } = await expectSaga(userLeftChannel, roomId, 'other-matrix-id')
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.channelsList.value).toHaveLength(1);
      expect(storeState.channelsList.value).toContain(roomId);
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

  it('removes the channels list and channels', async () => {
    const channelsList = { value: ['id-one'] };
    const channels = { 'id-one': { id: 'id-one', name: 'this should be removed' } };
    const notifications = { 'id-two': { id: 'id-two', name: 'do not remove this one' } };

    const {
      storeState: { normalized, channelsList: channelsListResult },
    } = await expectSaga(clearChannelsAndConversations)
      .withReducer(rootReducer)
      .withState({
        channelsList,
        normalized: { channels, notifications },
      })
      .run();

    expect(normalized).toEqual({
      channels: {},
      notifications,
    });

    expect(channelsListResult).toEqual({ value: [] });
  });

  describe(addChannel, () => {
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args);
    }

    it('adds channel to list', async () => {
      const initialState = new StoreBuilder().withConversationList({ id: 'conversation-id' });

      const { storeState } = await subject(addChannel, { id: 'new-convo', messages: [], otherMembers: [] })
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.channelsList.value).toIncludeSameMembers(['conversation-id', 'new-convo']);
    });

    it('does not duplicate the conversation', async () => {
      const initialState = new StoreBuilder().withConversationList({ id: 'existing-conversation-id' });

      const { storeState } = await subject(addChannel, {
        id: 'existing-conversation-id',
        messages: [],
        otherMembers: [],
      })
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.channelsList.value).toIncludeSameMembers(['existing-conversation-id']);
    });
  });

  describe(otherUserJoinedChannel, () => {
    it('finds the zOS user and adds the user to the otherMember list', async () => {
      const existingMembers = [
        { userId: 'user-1', matrixId: 'user-1' },
        { userId: 'user-2', matrixId: 'user-2' },
      ] as any;
      const newUser = { userId: 'new-user', matrixId: 'new-user', firstName: 'Jane', lastName: 'doe' };
      const initialState = new StoreBuilder()
        .withConversationList({
          id: 'conversation-id',
          otherMembers: existingMembers,
        })
        .withUsers(newUser);

      const { storeState } = await expectSaga(otherUserJoinedChannel, 'conversation-id', newUser.userId)
        .provide([[matchers.call.fn(getUserByMatrixId), newUser]])
        .withReducer(rootReducer, initialState.build())
        .run();

      const conversation = denormalizeChannel('conversation-id', storeState);
      expect(conversation.otherMembers.map((u) => u.matrixId)).toIncludeSameMembers(['user-1', 'user-2', 'new-user']);
    });
  });

  describe(otherUserLeftChannel, () => {
    it('removes the user from the otherMember list', async () => {
      const existingMembers = [
        { userId: 'user-1', matrixId: 'user-1' },
        { userId: 'user-2', matrixId: 'user-2' },
        { userId: 'user-3', matrixId: 'user-3' },
      ] as any;
      const initialState = new StoreBuilder().withConversationList({
        id: 'conversation-id',
        otherMembers: existingMembers,
      });

      const { storeState } = await expectSaga(otherUserLeftChannel, 'conversation-id', {
        userId: 'user-2',
        matrixId: 'user-2',
      })
        .provide([[matchers.call.fn(getUserByMatrixId), { userId: 'user-2' }]])
        .withReducer(rootReducer, initialState.build())
        .run();

      const conversation = denormalizeChannel('conversation-id', storeState);
      expect(conversation.otherMembers.map((u) => u.matrixId)).toIncludeSameMembers(['user-1', 'user-3']);
    });
  });
});
