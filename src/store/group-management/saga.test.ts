import * as matchers from 'redux-saga-test-plan/matchers';
import { removeMember, reset, roomMembersSelected } from './saga';
import { StoreBuilder } from '../test/store';
import { Stage, setIsAddingMembers, setAddMemberError } from '.';
import { expectSaga } from '../../test/saga';
import { rootReducer } from '../reducer';
import { chat } from '../../lib/chat';
import { denormalize as denormalizeUsers } from '../users';

describe('Group Management Saga', () => {
  describe(roomMembersSelected, () => {
    const action = {
      payload: {
        roomId: 'roomId123',
        users: [
          { value: 'user1', label: 'user1-label' },
          { value: 'user2', label: 'user2-label' },
        ],
      },
    };

    const mockUsers = [
      { matrixId: '@user1:server' },
      { matrixId: '@user2:server' },
    ];

    const chatClient = {
      addMembersToRoom: jest.fn(),
    };

    it('successfully adds members to a room', async () => {
      await expectSaga(roomMembersSelected, action)
        .withReducer(rootReducer)
        .withState(new StoreBuilder().build())
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [
            matchers.select(
              denormalizeUsers,
              action.payload.users.map((u) => u.value)
            ),
            mockUsers,
          ],
          [matchers.call.fn(chatClient.addMembersToRoom), [action.payload.roomId, mockUsers]],
        ])
        .put(setIsAddingMembers(true))
        .put(setIsAddingMembers(false))
        .run();
    });

    it('handles errors during add member', async () => {
      const action = {
        payload: {
          roomId: 'roomId123',
          users: [
            { value: 'user1', label: 'user1-label' },
            { value: 'user2', label: 'user2-label' },
          ],
        },
      };

      const mockUsers = [
        { matrixId: '@user1:server' },
        { matrixId: '@user2:server' },
      ];

      const mockError = new Error('Failed to add member, please try again...');

      const chatClient = {
        addMembersToRoom: jest.fn(() => {
          throw mockError;
        }),
      };

      await expectSaga(roomMembersSelected, action)
        .withReducer(rootReducer)
        .withState(new StoreBuilder().build())
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [
            matchers.select(
              denormalizeUsers,
              action.payload.users.map((u) => u.value)
            ),
            mockUsers,
          ],
        ])
        .put(setIsAddingMembers(true))
        .put(setIsAddingMembers(false))
        .put(setAddMemberError(mockError.message))
        .run();
    });

    it('exits early if roomId or selectedMembers are missing', async () => {
      const incompleteAction = {
        payload: { users: [{ value: 'user1' }] }, // roomId missing
      };
      await expectSaga(roomMembersSelected, incompleteAction).not.call.fn(chat.get).run();
    });
  });

  describe('reset', () => {
    it('resets to default state', async () => {
      const initialState = defaultState({
        stage: Stage.None,
        isAddingMembers: true,
        addMemberError: 'error',
      });

      const {
        storeState: { groupManagement: state },
      } = await expectSaga(reset).withReducer(rootReducer, initialState).run();

      expect(state).toEqual({
        stage: Stage.None,
        isAddingMembers: false,
        addMemberError: null,
      });
    });
  });

  describe(removeMember, () => {
    const chatClient = { removeUser: jest.fn() };

    it('removes a member from a room', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      await expectSaga(removeMember, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .provide([[matchers.call.fn(chat.get), chatClient]])
        .withReducer(rootReducer, initialState.build())
        // .call([chatClient, chatClient.removeUser], 'room-1', user)
        .call.like({
          context: chatClient,
          fn: chatClient.removeUser,
          args: ['room-1', user],
        })
        .run();
    });
  });
});

function defaultState(attrs = {}) {
  return new StoreBuilder()
    .withCurrentUser({ id: 'current-user-id' })
    .withOtherState({
      groupManagement: {
        stage: Stage.None,
        isAddingMembers: false,
        addMemberError: null,

        ...attrs,
      },
    })
    .build();
}
