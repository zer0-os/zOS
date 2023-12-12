import { testSaga } from 'redux-saga-test-plan';
import { call, race, take } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';
import { chat } from '../../lib/chat';

import {
  fetchChannels,
  fetchConversations,
  fetchChannelsAndConversations,
  delay,
  startChannelsAndConversationsRefresh,
  clearChannelsAndConversations,
  userLeftChannel,
  addChannel,
  otherUserJoinedChannel,
  otherUserLeftChannel,
  mapToZeroUsers,
  updateUserPresence,
} from './saga';

import { SagaActionTypes, setStatus } from '.';
import { RootState, rootReducer } from '../reducer';
import { AsyncListStatus } from '../normalized';
import { conversationsChannel } from './channels';
import { multicastChannel } from 'redux-saga';
import { ConversationStatus, denormalize as denormalizeChannel } from '../channels';
import { StoreBuilder } from '../test/store';
import { expectSaga } from '../../test/saga';
import { getZEROUsers } from './api';
import { mapOtherMembers } from './utils';

const mockChannel = (id: string) => ({
  id: `channel_${id}`,
  name: `channel ${id}`,
  icon: 'channel-icon',
  hasJoined: false,
  isChannel: true,
});

const mockConversation = (id: string) => ({
  id: `conversation_${id}`,
  name: `conversation ${id}`,
  icon: 'conversation-icon',
  hasJoined: true,
  isChannel: false,
});

const MOCK_CHANNELS = [mockChannel('0001'), mockChannel('0002'), mockChannel('0003')];
const MOCK_CONVERSATIONS = [mockConversation('0001'), mockConversation('0002')];

const chatClient = {
  getChannels: () => MOCK_CHANNELS,
  getConversations: () => MOCK_CONVERSATIONS,
  getUserPresence: () => {},
};

describe('channels list saga', () => {
  describe(fetchChannels, () => {
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args).provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getChannels), MOCK_CHANNELS],
        [matchers.call.fn(mapToZeroUsers), null],
      ]);
    }

    it('sets status to fetching', async () => {
      await subject(fetchChannels, { payload: '0x000000000000000000000000000000000000000A' })
        .put(setStatus(AsyncListStatus.Fetching))
        .run();
    });

    it('fetches channels', async () => {
      const id = '0x000000000000000000000000000000000000000A';

      await subject(fetchChannels, { payload: id }).call(chat.get).call([chatClient, chatClient.getChannels], id).run();
    });

    it('calls mapToZeroUsers after fetch', async () => {
      const id = '0x000000000000000000000000000000000000000A';

      await subject(fetchChannels, { payload: id })
        .call(chat.get)
        .call([chatClient, chatClient.getChannels], id)
        .call(mapToZeroUsers, MOCK_CHANNELS)
        .run();
    });

    it('sets status to Idle', async () => {
      const id = '0x000000000000000000000000000000000000000A';

      const { storeState } = await subject(fetchChannels, { payload: id }).withReducer(rootReducer).run();

      expect(storeState.channelsList.status).toBe(AsyncListStatus.Idle);
    });

    it('adds channel ids to channelsList state', async () => {
      const id = '0x000000000000000000000000000000000000000A';
      const ids = ['channel_0001', 'channel_0002', 'channel_0003'];

      const { storeState } = await subject(fetchChannels, { payload: id }).withReducer(rootReducer).run();

      expect(storeState.channelsList.value).toStrictEqual(ids);
    });

    it('adds channels to normalized state', async () => {
      const id = 'channel-0099';
      const name = 'the channel';
      const icon = 'channel-icon';
      const category = 'channel-category';
      const unreadCount = 1;
      const hasJoined = true;
      const isChannel = true;

      const { storeState } = await subject(fetchChannels, {
        payload: '0x000000000000000000000000000000000000000A',
      })
        .provide([
          [matchers.call.fn(chatClient.getChannels), [{ id, name, icon, category, unreadCount, hasJoined, isChannel }]],
        ])
        .withReducer(rootReducer)
        .run();

      expect(storeState.normalized.channels[id]).toEqual(
        expect.objectContaining({
          id,
          name,
          icon,
          category,
          unreadCount,
          hasJoined,
          isChannel,
        })
      );
    });
  });

  describe(fetchConversations, () => {
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args).provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getConversations), MOCK_CONVERSATIONS],
        [matchers.call.fn(mapToZeroUsers), null],
        [matchers.call.fn(updateUserPresence), null],
      ]);
    }

    it('fetches direct messages', async () => {
      await subject(fetchConversations, undefined)
        .withReducer(rootReducer, { channelsList: { value: [] } } as RootState)
        .call(chat.get)
        .call([chatClient, chatClient.getConversations])
        .run();
    });

    it('calls mapToZeroUsers after fetch', async () => {
      await subject(fetchConversations, undefined)
        .withReducer(rootReducer, { channelsList: { value: [] } } as RootState)
        .call(chat.get)
        .call([chatClient, chatClient.getConversations])
        .call(mapToZeroUsers, MOCK_CONVERSATIONS)
        .run();
    });

    it('announces conversations loaded', async () => {
      const conversationsChannelStub = multicastChannel();

      await subject(fetchConversations, undefined)
        .provide([
          [matchers.call.fn(conversationsChannel), conversationsChannelStub],
          [matchers.call.fn(chatClient.getConversations), MOCK_CONVERSATIONS],
        ])
        .withReducer(rootReducer, { channelsList: { value: [] } } as RootState)
        .put(conversationsChannelStub, { loaded: true })
        .run();
    });

    it('retains conversations that are not CREATED', async () => {
      const optimisticChannel1 = { id: 'optimistic-id-1', conversationStatus: ConversationStatus.CREATING } as any;
      const optimisticChannel2 = { id: 'optimistic-id-2', conversationStatus: ConversationStatus.ERROR } as any;
      const fetchedChannel = { id: 'conversation-id', messages: [] };

      const initialState = new StoreBuilder().withConversationList(optimisticChannel1, optimisticChannel2).build();

      const { storeState } = await subject(fetchConversations, undefined)
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

    it('removes channels that are duplicates of the newly fetched conversations', async () => {
      const fetchedConversations = [{ id: 'previously-a-channel', messages: [] }];

      const initialState = new StoreBuilder().withChannelList({ id: 'previously-a-channel' });

      const { storeState } = await subject(fetchConversations, undefined)
        .provide([[matchers.call([chatClient, chatClient.getConversations]), fetchedConversations]])
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.channelsList.value).toIncludeSameMembers(['previously-a-channel']);
    });
  });

  describe(fetchChannelsAndConversations, () => {
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args).provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getChannels), MOCK_CHANNELS],
        [matchers.call.fn(chatClient.getConversations), MOCK_CONVERSATIONS],
        [matchers.call.fn(delay), null],
        [matchers.call.fn(mapToZeroUsers), null],
      ]);
    }

    it('verify fetchChannelsAndConversations', async () => {
      const rootDomainId = '12345';

      const channel = {
        id: 'channel-id-1',
        name: 'the channel',
        icon: 'channel-icon',
        category: 'channel-category',
        unreadCount: 1,
        hasJoined: true,
        isChannel: true,
        createdAt: 7000,
        otherMembers: [],
        lastMessage: {},
        groupChannelType: '',
      };

      const conversation = {
        id: 'conversation-id-1',
        name: 'the conversation',
        icon: 'conversation-icon',
        category: null,
        unreadCount: 2,
        hasJoined: true,
        isChannel: false,
        createdAt: 5000,
        otherMembers: [],
        lastMessage: {},
        groupChannelType: '',
      };

      const { storeState } = await subject(fetchChannelsAndConversations, {})
        .provide([
          [matchers.call([chatClient, chatClient.getChannels], rootDomainId), [channel]],
          [matchers.call([chatClient, chatClient.getConversations]), [conversation]],
        ])
        .withReducer(rootReducer)
        .withState({ zns: { value: { rootDomainId } } })
        .run();

      expect(denormalizeChannel(channel.id, storeState).name).toEqual('the channel');
      expect(denormalizeChannel(conversation.id, storeState).name).toEqual('the conversation');
    });
  });

  describe(userLeftChannel, () => {
    it('Channel is removed from list when the current user has left a channel', async () => {
      const channelId = 'channel-id';
      const initialState = new StoreBuilder()
        .withCurrentUser({ id: 'current-user-id', matrixId: 'matrix-id' })
        .withUsers({ userId: 'current-user-id', matrixId: 'matrix-id' })
        .withChannelList({ id: 'one-channel' }, { id: channelId }, { id: 'other-channel' });

      const { storeState } = await expectSaga(userLeftChannel, channelId, 'matrix-id')
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.channelsList.value).toHaveLength(2);
      expect(storeState.channelsList.value).not.toContain(channelId);
    });

    it('does not remove channel if user is not the current user', async () => {
      const channelId = 'channel-id';
      const userId = 'current-user-id';
      const initialState = new StoreBuilder()
        .withCurrentUserId(userId)
        .withUsers({ userId, matrixId: 'matrix-id' })
        .withChannelList({ id: channelId });

      const { storeState } = await expectSaga(userLeftChannel, channelId, 'other-matrix-id')
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.channelsList.value).toHaveLength(1);
      expect(storeState.channelsList.value).toContain(channelId);
    });

    it('changes active conversation if user leaves (is removed from) the currently active one', async () => {
      const channelId = 'conversation-id';
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
          { id: channelId },
          {
            id: 'conversation-2',
            lastMessage: { createdAt: 10000001 } as any,
            messages: [{ id: '2', createdAt: 10000001 }] as any,
          }
        )
        .withActiveConversation({ id: channelId })
        .build();

      const { storeState } = await expectSaga(userLeftChannel, channelId, 'matrix-id')
        .withReducer(rootReducer, initialState)
        .run();

      expect(storeState.chat.activeConversationId).toEqual('conversation-2');
    });
  });

  it('verify startChannelsAndConversationsRefresh', () => {
    testSaga(startChannelsAndConversationsRefresh)
      .next({ abort: undefined, success: true })
      .inspect((raceValue) => {
        expect(raceValue).toStrictEqual(
          race({
            abort: take(SagaActionTypes.StopChannelsAndConversationsAutoRefresh),
            success: call(fetchChannelsAndConversations),
          })
        );
      })

      .next({ abort: true, success: undefined })
      .inspect((returnValue) => {
        expect(returnValue).toBeFalse();
      })

      .next()
      .isDone();
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
        [matchers.call.fn(updateUserPresence), null],
      ]);
    }

    it('adds channel to list', async () => {
      const initialState = new StoreBuilder()
        .withConversationList({ id: 'conversation-id' })
        .withChannelList({ id: 'channel-id' });

      const { storeState } = await subject(addChannel, { id: 'new-convo', messages: [] })
        .withReducer(rootReducer, initialState.build())
        .run();

      expect(storeState.channelsList.value).toIncludeSameMembers(['conversation-id', 'channel-id', 'new-convo']);
    });

    it('does not duplicate the conversation', async () => {
      const initialState = new StoreBuilder().withConversationList({ id: 'existing-conversation-id' });

      const { storeState } = await subject(addChannel, { id: 'existing-conversation-id', messages: [] })
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
    const channels = [
      {
        id: 'channel-1',
        otherMembers: [
          { matrixId: 'matrix-id-1', userId: 'matrix-id-1' },
          { matrixId: 'matrix-id-2', userId: 'matrix-id-2' },
        ],
        messages: [],
      },
      {
        id: 'channel-2',
        otherMembers: [{ matrixId: 'matrix-id-3', userId: 'matrix-id-3' }],
        messages: [],
      },
    ] as any;

    const zeroUsers = [
      {
        userId: 'user-1',
        matrixId: 'matrix-id-1',
        profileId: 'profile-1',
        firstName: 'first-1',
        lastName: 'last-1',
      },
      {
        userId: 'user-2',
        matrixId: 'matrix-id-2',
        profileId: 'profile-2',
        firstName: 'first-2',
        lastName: 'last-2',
      },
      {
        userId: 'user-3',
        matrixId: 'matrix-id-3',
        profileId: 'profile-3',
        firstName: 'first-3',
        lastName: 'last-3',
      },
    ] as any;

    it('calls getZEROUsers by merging all matrixIds', async () => {
      await expectSaga(mapToZeroUsers, channels)
        .withReducer(rootReducer)
        .call(getZEROUsers, ['matrix-id-1', 'matrix-id-2', 'matrix-id-3'])
        .run();
    });

    it('creates map for zero users after fetching from api', async () => {
      const expectedMap = {
        'matrix-id-1': {
          userId: 'user-1',
          matrixId: 'matrix-id-1',
          profileId: 'profile-1',
          firstName: 'first-1',
          lastName: 'last-1',
        },
        'matrix-id-2': {
          userId: 'user-2',
          matrixId: 'matrix-id-2',
          profileId: 'profile-2',
          firstName: 'first-2',
          lastName: 'last-2',
        },
        'matrix-id-3': {
          userId: 'user-3',
          matrixId: 'matrix-id-3',
          profileId: 'profile-3',
          firstName: 'first-3',
          lastName: 'last-3',
        },
      };

      await expectSaga(mapToZeroUsers, channels)
        .withReducer(rootReducer)
        .provide([[call(getZEROUsers, ['matrix-id-1', 'matrix-id-2', 'matrix-id-3']), zeroUsers]])
        .call(mapOtherMembers, channels, expectedMap)
        .run();
    });

    it('maps Other Members of channels to ZERO Users and save normalized state', async () => {
      const initialState = new StoreBuilder().withChannelList(channels[0], channels[1]);

      const { storeState } = await expectSaga(mapToZeroUsers, channels)
        .withReducer(rootReducer, initialState.build())
        .provide([[call(getZEROUsers, ['matrix-id-1', 'matrix-id-2', 'matrix-id-3']), zeroUsers]])
        .run();

      const channel1 = denormalizeChannel('channel-1', storeState);
      expect(channel1.otherMembers).toIncludeSameMembers([
        {
          matrixId: 'matrix-id-1',
          userId: 'user-1',
          profileId: 'profile-1',
          firstName: 'first-1',
          lastName: 'last-1',
          profileImage: undefined,
        },
        {
          matrixId: 'matrix-id-2',
          userId: 'user-2',
          profileId: 'profile-2',
          firstName: 'first-2',
          lastName: 'last-2',
          profileImage: undefined,
        },
      ]);

      const channel2 = denormalizeChannel('channel-2', storeState);
      expect(channel2.otherMembers).toIncludeSameMembers([
        {
          matrixId: 'matrix-id-3',
          userId: 'user-3',
          profileId: 'profile-3',
          firstName: 'first-3',
          lastName: 'last-3',
          profileImage: undefined,
        },
      ]);
    });

    it('maps channel message senders and saves normalized state', async () => {
      channels[0].messages = [
        { message: 'hi', sender: { userId: 'matrix-id-1', firstName: '' } },
        { message: 'hello', sender: { userId: 'matrix-id-2', firstName: '' } },
      ];
      channels[1].messages = [{ message: 'hey', sender: { userId: 'matrix-id-3', firstName: '' } }];

      const initialState = new StoreBuilder().withChannelList(channels[0], channels[1]);

      await expectSaga(mapToZeroUsers, channels)
        .withReducer(rootReducer, initialState.build())
        .provide([[call(getZEROUsers, ['matrix-id-1', 'matrix-id-2', 'matrix-id-3']), zeroUsers]])
        .run();

      expect(channels[0].messages[0].sender).toStrictEqual({
        userId: 'user-1',
        profileId: 'profile-1',
        firstName: 'first-1',
        lastName: 'last-1',
        profileImage: undefined,
      });
      expect(channels[0].messages[1].sender).toStrictEqual({
        userId: 'user-2',
        profileId: 'profile-2',
        firstName: 'first-2',
        lastName: 'last-2',
        profileImage: undefined,
      });
      expect(channels[1].messages[0].sender).toStrictEqual({
        userId: 'user-3',
        profileId: 'profile-3',
        firstName: 'first-3',
        lastName: 'last-3',
        profileImage: undefined,
      });
    });

    it('maps current user as sender', async () => {
      channels[0].messages = [{ message: 'hi', sender: { userId: 'matrix-id', firstName: '' } }];

      const initialState = new StoreBuilder()
        .withCurrentUser({
          id: 'current-user',
          matrixId: 'matrix-id',
          profileId: 'profile-id',
          profileSummary: {
            firstName: 'Jack',
            lastName: 'Black',
            profileImage: '/cool-image.jpg',
          } as any,
        })
        .withChannelList(channels[0]);

      await expectSaga(mapToZeroUsers, channels)
        .withReducer(rootReducer, initialState.build())
        .provide([[matchers.call.fn(getZEROUsers), zeroUsers]])
        .run();

      expect(channels[0].messages[0].sender).toEqual(
        expect.objectContaining({
          userId: 'current-user',
          profileId: 'profile-id',
          firstName: 'Jack',
          lastName: 'Black',
          profileImage: '/cool-image.jpg',
        })
      );
    });
  });

  describe(updateUserPresence, () => {
    function subject(conversations, provide = []) {
      return expectSaga(updateUserPresence, conversations).provide([
        [matchers.call.fn(chat.get), chatClient],
        ...provide,
      ]);
    }

    const mockOtherMembers = [{ matrixId: 'member_001' }, { matrixId: 'member_002' }, { matrixId: 'member_003' }];
    const mockConversations = [{ otherMembers: mockOtherMembers }];

    it('fetches and updates user presence data', async () => {
      const mockPresenceData = {
        lastSeenAt: '2023-01-01T00:00:00.000Z',
        isOnline: true,
      };

      await subject(mockConversations, [
        [matchers.call([chatClient, chatClient.getUserPresence], 'member_001'), mockPresenceData],
        [matchers.call([chatClient, chatClient.getUserPresence], 'member_002'), mockPresenceData],
        [matchers.call([chatClient, chatClient.getUserPresence], 'member_003'), mockPresenceData],
      ])
        .call(chat.get)
        .call([chatClient, chatClient.getUserPresence], 'member_001')
        .call([chatClient, chatClient.getUserPresence], 'member_002')
        .call([chatClient, chatClient.getUserPresence], 'member_003')
        .run();
    });

    it('does not fail if member does not have matrixId', async () => {
      const conversationsWithMissingMatrixId = [{ otherMembers: [{ matrixId: null }] }];

      await subject(conversationsWithMissingMatrixId).call(chat.get).not.call(chatClient.getUserPresence).run();
    });

    it('should set lastSeenAt, and isOnline to true if user is online', () => {
      const mockConversations = [
        {
          id: 'conversation_0001',
          otherMembers: [
            {
              userId: 'user_1',
              matrixId: 'matrix_1',
              lastSeenAt: '',
              isOnline: false,
            },
          ],
        },
      ];

      const mockPresenceData1 = { lastSeenAt: '2023-10-17T10:00:00.000Z', isOnline: true };

      testSaga(updateUserPresence, mockConversations)
        .next()
        .call(chat.get)
        .next(chatClient)
        .call([chatClient, chatClient.getUserPresence], 'matrix_1')
        .next(mockPresenceData1)
        .isDone();

      expect(mockConversations[0].otherMembers[0].lastSeenAt).toBe(mockPresenceData1.lastSeenAt);
      expect(mockConversations[0].otherMembers[0].isOnline).toBe(mockPresenceData1.isOnline);
    });

    it('should set lastSeenAt to null and isOnline to false if user is offline', () => {
      const mockConversations = [
        {
          id: 'conversation_0001',
          otherMembers: [
            {
              userId: 'user_1',
              matrixId: 'matrix_1',
              lastSeenAt: '',
              isOnline: false,
            },
          ],
        },
      ];

      const mockPresenceData1 = { lastSeenAt: null, isOnline: false };

      testSaga(updateUserPresence, mockConversations)
        .next()
        .call(chat.get)
        .next(chatClient)
        .call([chatClient, chatClient.getUserPresence], 'matrix_1')
        .next(mockPresenceData1)
        .isDone();

      expect(mockConversations[0].otherMembers[0].lastSeenAt).toBe(mockPresenceData1.lastSeenAt);
      expect(mockConversations[0].otherMembers[0].isOnline).toBe(mockPresenceData1.isOnline);
    });
  });
});
