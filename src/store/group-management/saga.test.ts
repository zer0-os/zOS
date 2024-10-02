import * as matchers from 'redux-saga-test-plan/matchers';
import {
  removeMember,
  editConversationNameAndIcon,
  reset,
  roomMembersSelected,
  toggleIsSecondarySidekick,
  setMemberAsModerator,
  removeMemberAsModerator,
} from './saga';
import { StoreBuilder } from '../test/store';
import {
  Stage,
  setIsAddingMembers,
  setAddMemberError,
  setEditConversationState,
  setEditConversationGeneralError,
  setEditConversationImageError,
  MemberManagementDialogStage,
  setSecondarySidekickOpen,
} from '.';
import { expectSaga } from '../../test/saga';
import { rootReducer } from '../reducer';
import { chat, removeUserAsModerator, setUserAsModerator, uploadFile } from '../../lib/chat';
import { denormalize as denormalizeUsers } from '../users';
import { EditConversationState } from './types';
import { throwError } from 'redux-saga-test-plan/providers';

describe('Group Management Saga', () => {
  const chatClient = {
    addMembersToRoom: jest.fn(),
    editRoomNameAndIcon: jest.fn(),
  };

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
        errors: { editConversationErrors: { image: '', general: '' } },
        editConversationState: EditConversationState.NONE,
      });
    });
  });

  describe(removeMember, () => {
    const chatClient = { removeUser: jest.fn() };
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args).provide([
        [matchers.call.fn(chat.get), chatClient],
      ]);
    }

    it('removes a member from a room', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      await subject(removeMember, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .withReducer(rootReducer, initialState.build())
        .call.like({
          context: chatClient,
          fn: chatClient.removeUser,
          args: ['room-1', user],
        })
        .run();
    });

    it('closes the dialog when successful', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      const { storeState } = await subject(removeMember, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.groupManagement.memberManagement.stage).toEqual(MemberManagementDialogStage.CLOSED);
    });

    it('sets error message when error occurs', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      const { storeState } = await subject(removeMember, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .provide([
          [
            matchers.call.like({ context: chatClient, fn: chatClient.removeUser }),
            throwError(new Error('Simulated: Failed to remove user')),
          ],
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.groupManagement.memberManagement.error).toEqual('Failed to remove member, please try again');
    });

    it('keeps the dialog open when error occurs', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      const { storeState } = await subject(removeMember, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .provide([
          [
            matchers.call.like({ context: chatClient, fn: chatClient.removeUser }),
            throwError(new Error('Simulated: Failed to remove user')),
          ],
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.groupManagement.memberManagement.stage).toEqual(MemberManagementDialogStage.OPEN);
    });
  });

  describe(setMemberAsModerator, () => {
    const chatClient = { removeUser: jest.fn() };
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args).provide([
        [matchers.call.fn(chat.get), chatClient],
      ]);
    }

    it('sets a user as moderator', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      await subject(setMemberAsModerator, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .withReducer(rootReducer, initialState.build())
        .call.like({
          fn: setUserAsModerator,
          args: ['room-1', user],
        })
        .run();
    });

    it('closes the dialog when successful', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      const { storeState } = await subject(setMemberAsModerator, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .withReducer(rootReducer, initialState.build())
        .provide([[matchers.call.fn(setUserAsModerator), {}]])
        .run();

      expect(storeState.groupManagement.memberManagement.stage).toEqual(MemberManagementDialogStage.CLOSED);
    });

    it('sets error message and keeps the dialog open when error occurs', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      const { storeState } = await subject(setMemberAsModerator, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .provide([
          [
            matchers.call.fn(setUserAsModerator),
            throwError(new Error('Simulated: Failed to set user as moderator')),
          ],
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.groupManagement.memberManagement.error).toEqual(
        'Failed to set member as moderator, please try again'
      );
      expect(storeState.groupManagement.memberManagement.stage).toEqual(MemberManagementDialogStage.OPEN);
    });
  });

  describe(removeMemberAsModerator, () => {
    const chatClient = { removeUser: jest.fn() };
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args).provide([
        [matchers.call.fn(chat.get), chatClient],
      ]);
    }

    it('removes a user as moderator', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      await subject(removeMemberAsModerator, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .withReducer(rootReducer, initialState.build())
        .call.like({
          fn: removeUserAsModerator,
          args: ['room-1', user],
        })
        .run();
    });

    it('closes the dialog when successful', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      const { storeState } = await subject(removeMemberAsModerator, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .withReducer(rootReducer, initialState.build())
        .provide([[matchers.call.fn(removeUserAsModerator), {}]])
        .run();

      expect(storeState.groupManagement.memberManagement.stage).toEqual(MemberManagementDialogStage.CLOSED);
    });

    it('sets error message and keeps the dialog open when error occurs', async () => {
      const user = { userId: 'user-1', matrixId: 'matrix-1' };
      const initialState = new StoreBuilder().withUsers(user);
      const { storeState } = await subject(removeMemberAsModerator, { payload: { userId: 'user-1', roomId: 'room-1' } })
        .provide([
          [
            matchers.call.fn(removeUserAsModerator),
            throwError(new Error('Simulated: Failed to remove user as moderator')),
          ],
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.groupManagement.memberManagement.error).toEqual(
        'Failed to remove member as moderator, please try again'
      );
      expect(storeState.groupManagement.memberManagement.stage).toEqual(MemberManagementDialogStage.OPEN);
    });
  });

  describe('editConversation name and icon', () => {
    const roomId = 'roomId123';
    const name = 'new-name';
    const image = { some: 'new-file' };

    it('edits the conversation name and icon', async () => {
      await expectSaga(editConversationNameAndIcon, { payload: { roomId, name, image } })
        .withReducer(rootReducer, defaultState({ stage: Stage.EditConversation }))
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [matchers.call.fn(chatClient.editRoomNameAndIcon), {}],
          [matchers.call.fn(uploadFile), 'image-url'],
        ])
        .call(uploadFile, image)
        .call([chatClient, chatClient.editRoomNameAndIcon], roomId, name, 'image-url')
        .put(setEditConversationState(EditConversationState.SUCCESS))
        .put(setEditConversationImageError(''))
        .put(setEditConversationGeneralError(''))
        .run();
    });

    it('sets image error if image upload fails', async () => {
      await expectSaga(editConversationNameAndIcon, { payload: { roomId, name, image } })
        .withReducer(rootReducer, defaultState({ stage: Stage.EditConversation }))
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [matchers.call.fn(chatClient.editRoomNameAndIcon), {}],
          [matchers.call.fn(uploadFile), throwError(new Error('Image upload failed'))],
        ])
        .put(setEditConversationImageError('Failed to upload image, please try again...'))
        .run();
    });

    it('sets general error if API response is not successful', async () => {
      await expectSaga(editConversationNameAndIcon, { payload: { roomId, name, image } })
        .withReducer(rootReducer, defaultState({ stage: Stage.EditConversation }))
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [matchers.call.fn(chatClient.editRoomNameAndIcon), throwError(new Error('matrix API error'))],
          [matchers.call.fn(uploadFile), 'image-url'],
        ])
        .put(setEditConversationGeneralError('An unknown error has occurred'))
        .put(setEditConversationState(EditConversationState.LOADED))
        .run();
    });
  });

  describe('toggleSecondarySidekick', () => {
    it('toggles the isSecondarySidekickOpen state to true', async () => {
      const initialState = defaultState({ isSecondarySidekickOpen: false });

      const { storeState } = await expectSaga(toggleIsSecondarySidekick)
        .withReducer(rootReducer, initialState)
        .put(setSecondarySidekickOpen(true))
        .run();

      expect(storeState.groupManagement.isSecondarySidekickOpen).toBe(true);
    });

    it('toggles the isSecondarySidekickOpen state to false', async () => {
      const initialState = defaultState({ isSecondarySidekickOpen: true });

      const { storeState } = await expectSaga(toggleIsSecondarySidekick)
        .withReducer(rootReducer, initialState)
        .put(setSecondarySidekickOpen(false))
        .run();

      expect(storeState.groupManagement.isSecondarySidekickOpen).toBe(false);
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
        errors: { editConversationErrors: { image: '', general: '' } },
        editConversationState: EditConversationState.NONE,

        ...attrs,
      },
    })
    .build();
}
