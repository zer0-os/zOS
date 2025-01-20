import { testSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';
import { chat, getRoomTags } from '../../lib/chat';

import {
  fetchConversations,
  clearChannelsAndConversations,
  userLeftChannel,
  addChannel,
  otherUserJoinedChannel,
  otherUserLeftChannel,
  mapToZeroUsers,
  fetchRoomName,
  roomNameChanged,
  fetchRoomAvatar,
  roomAvatarChanged,
  loadSecondaryConversationData,
  fetchRoomGroupType,
  roomGroupTypeChanged,
} from './saga';

import { RootState, rootReducer } from '../reducer';
import { ConversationEvents, getConversationsBus } from './channels';
import { multicastChannel } from 'redux-saga';
import { ConversationStatus, denormalize as denormalizeChannel } from '../channels';
import { StoreBuilder } from '../test/store';
import { expectSaga } from '../../test/saga';
import { getZEROUsers } from './api';
import { mapAdminUserIdToZeroUserId, mapChannelMembers } from './utils';
import { openFirstConversation } from '../channels/saga';
import { getUserReadReceiptPreference } from '../user-profile/saga';
import { clearLastActiveConversation } from '../../lib/last-conversation';

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
  getRoomNameById: () => {},
  getRoomAvatarById: () => {},
  getRoomGroupTypeById: () => {},
};

describe('channels list saga', () => {
  describe(fetchConversations, () => {
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args).provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getConversations), MOCK_CONVERSATIONS],
        [matchers.call.fn(mapToZeroUsers), null],
        [matchers.call.fn(getUserReadReceiptPreference), null],
        [matchers.call.fn(getRoomTags), null],
      ]);
    }

    it('fetches direct messages', async () => {
      await subject(fetchConversations)
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [matchers.call.fn(chatClient.getConversations), MOCK_CONVERSATIONS],
          [matchers.call.fn(getUserReadReceiptPreference), null],
        ])
        .withReducer(rootReducer, { channelsList: { value: [] } } as RootState)
        .call(chat.get)
        .call([chatClient, chatClient.getConversations])
        .run();
    });

    it('calls mapToZeroUsers after fetch', async () => {
      await subject(fetchConversations)
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [matchers.call.fn(chatClient.getConversations), MOCK_CONVERSATIONS],
          [matchers.call.fn(getUserReadReceiptPreference), null],
        ])
        .withReducer(rootReducer, { channelsList: { value: [] } } as RootState)
        .call(chat.get)
        .call([chatClient, chatClient.getConversations])
        .call(mapToZeroUsers, MOCK_CONVERSATIONS)
        .run();
    });

    it('announces conversations loaded', async () => {
      const conversationsChannelStub = multicastChannel();

      await subject(fetchConversations)
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [matchers.call.fn(chatClient.getConversations), MOCK_CONVERSATIONS],
          [matchers.call.fn(mapToZeroUsers), null],
          [matchers.call.fn(mapAdminUserIdToZeroUserId), null],
          [matchers.call.fn(getConversationsBus), conversationsChannelStub],
          [matchers.call.fn(getUserReadReceiptPreference), null],
        ])
        .withReducer(rootReducer, { channelsList: { value: [] } } as RootState)
        .put(conversationsChannelStub, { type: ConversationEvents.ConversationsLoaded })
        .run();
    });

    it('retains conversations that are not CREATED', async () => {
      const optimisticChannel1 = { id: 'optimistic-id-1', conversationStatus: ConversationStatus.CREATING } as any;
      const optimisticChannel2 = { id: 'optimistic-id-2', conversationStatus: ConversationStatus.ERROR } as any;
      const fetchedChannel = { id: 'conversation-id', messages: [] };

      const initialState = new StoreBuilder().withConversationList(optimisticChannel1, optimisticChannel2).build();

      const { storeState } = await subject(fetchConversations)
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [matchers.call([chatClient, chatClient.getConversations]), [fetchedChannel]],
        ])
        .withReducer(rootReducer, initialState)
        .run();

      expect(storeState.channelsList.value).toIncludeSameMembers([
        'optimistic-id-1',
        'optimistic-id-2',
        'conversation-id',
      ]);
    });

    it('calls loadSecondaryConversationData', async () => {
      await subject(fetchConversations)
        .provide([
          [matchers.call.fn(chat.get), chatClient],
          [matchers.call.fn(chatClient.getConversations), MOCK_CONVERSATIONS],
          [matchers.call.fn(mapToZeroUsers), null],
          [matchers.call.fn(getUserReadReceiptPreference), null],
          [matchers.call.fn(getRoomTags), null],
        ])
        .withReducer(rootReducer, { channelsList: { value: [] } } as RootState)
        .fork(loadSecondaryConversationData, [...MOCK_CONVERSATIONS])
        .run();
    });
  });

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
      return expectSaga(...args).provide([
        [matchers.call.fn(mapToZeroUsers), null],
      ]);
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
      const initialState = new StoreBuilder()
        .withConversationList({
          id: 'conversation-id',
          otherMembers: existingMembers,
        })
        .withUsers({ userId: 'new-user', matrixId: 'new-user', firstName: 'Jane', lastName: 'doe' });

      const { storeState } = await expectSaga(otherUserJoinedChannel, 'conversation-id', {
        userId: 'new-user',
        matrixId: 'new-user',
      })
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
        .withReducer(rootReducer, initialState.build())
        .run();

      const conversation = denormalizeChannel('conversation-id', storeState);
      expect(conversation.otherMembers.map((u) => u.matrixId)).toIncludeSameMembers(['user-1', 'user-3']);
    });
  });

  describe(mapToZeroUsers, () => {
    let rooms, zeroUsers;

    beforeEach(() => {
      rooms = [
        {
          id: 'room-1',
          otherMembers: [],
          memberHistory: [
            { matrixId: 'matrix-id-1', userId: 'matrix-id-1' },
            { matrixId: 'matrix-id-2', userId: 'matrix-id-2' },
          ],
          messages: [],
          moderatorIds: [],
        },
        {
          id: 'room-2',
          otherMembers: [],
          memberHistory: [
            { matrixId: 'matrix-id-3', userId: 'matrix-id-3' },
          ],
          messages: [],
          moderatorIds: [],
        },
      ] as any;

      zeroUsers = [
        {
          userId: 'user-1',
          matrixId: 'matrix-id-1',
          profileId: 'profile-1',
          firstName: 'first-1',
          lastName: 'last-1',
          primaryZID: 'primary-zid-1',
          displaySubHandle: 'primary-zid-1',
          profileImage: 'mxc://profile-image-url-1',
        },
        {
          userId: 'user-2',
          matrixId: 'matrix-id-2',
          profileId: 'profile-2',
          firstName: 'first-2',
          lastName: 'last-2',
          primaryZID: 'primary-zid-2',
          displaySubHandle: 'primary-zid-2',
          profileImage: 'mxc://profile-image-url-2',
        },
        {
          userId: 'user-3',
          matrixId: 'matrix-id-3',
          profileId: 'profile-3',
          firstName: 'first-3',
          lastName: 'last-3',
          primaryZID: '',
          displaySubHandle: '',
          profileImage: 'mxc://profile-image-url-3',
        },
      ] as any;
    });

    it('calls getZEROUsers by merging all matrixIds', async () => {
      await expectSaga(mapToZeroUsers, rooms)
        .withReducer(rootReducer)
        .call(getZEROUsers, ['matrix-id-1', 'matrix-id-2', 'matrix-id-3'])
        .run();
    });

    it('creates map for zero users', async () => {
      const expectedMap = {
        'matrix-id-1': {
          userId: 'user-1',
          matrixId: 'matrix-id-1',
          profileId: 'profile-1',
          firstName: 'first-1',
          lastName: 'last-1',
          primaryZID: 'primary-zid-1',
          displaySubHandle: 'primary-zid-1',
          profileImage: 'mxc://profile-image-url-1',
        },
        'matrix-id-2': {
          userId: 'user-2',
          matrixId: 'matrix-id-2',
          profileId: 'profile-2',
          firstName: 'first-2',
          lastName: 'last-2',
          primaryZID: 'primary-zid-2',
          displaySubHandle: 'primary-zid-2',
          profileImage: 'mxc://profile-image-url-2',
        },
        'matrix-id-3': {
          userId: 'user-3',
          matrixId: 'matrix-id-3',
          profileId: 'profile-3',
          firstName: 'first-3',
          lastName: 'last-3',
          primaryZID: '',
          displaySubHandle: '',
          profileImage: 'mxc://profile-image-url-3',
        },
      };

      await expectSaga(mapToZeroUsers, rooms)
        .withReducer(rootReducer)
        .provide([
          [call(getZEROUsers, ['matrix-id-1', 'matrix-id-2', 'matrix-id-3']), zeroUsers],
        ])
        .call(mapChannelMembers, rooms, expectedMap)
        .run();
    });

    it('maps member history of channels to ZERO Users', async () => {
      const initialState = new StoreBuilder().withConversationList(rooms[0], rooms[1]);

      await expectSaga(mapToZeroUsers, rooms)
        .withReducer(rootReducer, initialState.build())
        .provide([
          [call(getZEROUsers, ['matrix-id-1', 'matrix-id-2', 'matrix-id-3']), zeroUsers],
        ])
        .run();

      expect(rooms[0].memberHistory).toIncludeSameMembers([
        {
          matrixId: 'matrix-id-1',
          userId: 'user-1',
          profileId: 'profile-1',
          firstName: 'first-1',
          lastName: 'last-1',
          profileImage: 'mxc://profile-image-url-1',
          primaryZID: 'primary-zid-1',
          displaySubHandle: 'primary-zid-1',
        },
        {
          matrixId: 'matrix-id-2',
          userId: 'user-2',
          profileId: 'profile-2',
          firstName: 'first-2',
          lastName: 'last-2',
          profileImage: 'mxc://profile-image-url-2',
          primaryZID: 'primary-zid-2',
          displaySubHandle: 'primary-zid-2',
        },
      ]);

      expect(rooms[1].memberHistory).toIncludeSameMembers([
        {
          matrixId: 'matrix-id-3',
          userId: 'user-3',
          profileId: 'profile-3',
          firstName: 'first-3',
          lastName: 'last-3',
          profileImage: 'mxc://profile-image-url-3',
          primaryZID: '',
          displaySubHandle: '',
        },
      ]);
    });

    it('maps channel message senders and saves normalized state', async () => {
      rooms[0].messages = [
        { message: 'hi', sender: { userId: 'matrix-id-1', firstName: '' } },
        { message: 'hello', sender: { userId: 'matrix-id-2', firstName: '' } },
      ];
      rooms[1].messages = [{ message: 'hey', sender: { userId: 'matrix-id-3', firstName: '' } }];

      const initialState = new StoreBuilder();

      await expectSaga(mapToZeroUsers, rooms)
        .withReducer(rootReducer, initialState.build())
        .provide([
          [call(getZEROUsers, ['matrix-id-1', 'matrix-id-2', 'matrix-id-3']), zeroUsers],
        ])
        .run();

      expect(rooms[0].messages[0].sender).toStrictEqual({
        userId: 'user-1',
        profileId: 'profile-1',
        firstName: 'first-1',
        lastName: 'last-1',
        profileImage: 'mxc://profile-image-url-1',
        primaryZID: 'primary-zid-1',
        displaySubHandle: 'primary-zid-1',
      });
      expect(rooms[0].messages[1].sender).toStrictEqual({
        userId: 'user-2',
        profileId: 'profile-2',
        firstName: 'first-2',
        lastName: 'last-2',
        profileImage: 'mxc://profile-image-url-2',
        primaryZID: 'primary-zid-2',
        displaySubHandle: 'primary-zid-2',
      });
      expect(rooms[1].messages[0].sender).toStrictEqual({
        userId: 'user-3',
        profileId: 'profile-3',
        firstName: 'first-3',
        lastName: 'last-3',
        profileImage: 'mxc://profile-image-url-3',
        primaryZID: '',
        displaySubHandle: '',
      });
    });

    it('maps moderatorIds of channels to ZERO Users and save normalized state', async () => {
      rooms[0].moderatorIds = ['matrix-id-1', 'matrix-id-2'];
      rooms[1].moderatorIds = ['matrix-id-3'];

      const initialState = new StoreBuilder().withConversationList(rooms[0], rooms[1]);

      await expectSaga(mapToZeroUsers, rooms)
        .withReducer(rootReducer, initialState.build())
        .provide([
          [call(getZEROUsers, ['matrix-id-1', 'matrix-id-2', 'matrix-id-3']), zeroUsers],
        ])
        .run();

      expect(rooms[0].moderatorIds).toIncludeSameMembers(['user-1', 'user-2']);
      expect(rooms[1].moderatorIds).toIncludeSameMembers(['user-3']);
    });
  });

  describe(fetchRoomName, () => {
    function subject(roomId: string, provide = []) {
      return expectSaga(fetchRoomName, roomId).provide([
        [matchers.call.fn(chat.get), chatClient],
        ...provide,
      ]);
    }

    const mockRoomName = 'some-room-name';

    it('fetches and updates room name data', async () => {
      await subject('room-id', [[matchers.call([chatClient, chatClient.getRoomNameById], 'room-id'), mockRoomName]])
        .call(chat.get)
        .call([chatClient, chatClient.getRoomNameById], 'room-id')
        .run();
    });

    it('calls roomNameChanged when name is fetched', () => {
      testSaga(fetchRoomName, 'room-id')
        .next()
        .call(chat.get)
        .next(chatClient)
        .call([chatClient, chatClient.getRoomNameById], 'room-id')
        .next(mockRoomName)
        .call(roomNameChanged, 'room-id', mockRoomName)
        .next()
        .isDone();
    });
  });

  describe(fetchRoomAvatar, () => {
    function subject(roomId: string, provide = []) {
      return expectSaga(fetchRoomAvatar, roomId).provide([
        [matchers.call.fn(chat.get), chatClient],
        ...provide,
      ]);
    }

    const mockRoomAvatar = 'some-room-avatar';

    it('fetches and updates room avatar data', async () => {
      await subject('room-id', [[matchers.call([chatClient, chatClient.getRoomAvatarById], 'room-id'), mockRoomAvatar]])
        .call(chat.get)
        .call([chatClient, chatClient.getRoomAvatarById], 'room-id')
        .run();
    });

    it('calls roomAvatarChanged when avatar is fetched', () => {
      testSaga(fetchRoomAvatar, 'room-id')
        .next()
        .call(chat.get)
        .next(chatClient)
        .call([chatClient, chatClient.getRoomAvatarById], 'room-id')
        .next(mockRoomAvatar)
        .call(roomAvatarChanged, 'room-id', mockRoomAvatar)
        .next()
        .isDone();
    });
  });

  describe(fetchRoomGroupType, () => {
    function subject(roomId: string, provide = []) {
      return expectSaga(fetchRoomGroupType, roomId).provide([
        [matchers.call.fn(chat.get), chatClient],
        ...provide,
      ]);
    }

    const mockGroupType = 'some-group-type';

    it('fetches and updates room group type data', async () => {
      await subject('room-id', [
        [matchers.call([chatClient, chatClient.getRoomGroupTypeById], 'room-id'), mockGroupType],
      ])
        .call(chat.get)
        .call([chatClient, chatClient.getRoomGroupTypeById], 'room-id')
        .run();
    });

    it('calls roomGroupTypeChanged when group type is fetched', () => {
      testSaga(fetchRoomGroupType, 'room-id')
        .next()
        .call(chat.get)
        .next(chatClient)
        .call([chatClient, chatClient.getRoomGroupTypeById], 'room-id')
        .next(mockGroupType)
        .call(roomGroupTypeChanged, 'room-id', mockGroupType)
        .next()
        .isDone();
    });
  });
});
