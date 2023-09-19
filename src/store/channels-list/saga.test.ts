import { expectSaga, testSaga } from 'redux-saga-test-plan';
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
} from './saga';

import { SagaActionTypes, setStatus } from '.';
import { RootState, rootReducer } from '../reducer';
import { AsyncListStatus } from '../normalized';
import { conversationsChannel } from './channels';
import { multicastChannel } from 'redux-saga';
import { ConversationStatus, denormalize as denormalizeChannel } from '../channels';
import { StoreBuilder } from '../test/store';

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

const MOCK_CONVERSATIONS = [
  {
    name: 'conversation 1',
    id: 'conversation_0001',
    url: 'conversation_0001',
    icon: 'conversation-icon',
    hasJoined: true,
    isChannel: false,
  },
  {
    name: 'conversation 2',
    id: 'conversation_0002',
    url: 'conversation_0002',
    icon: 'conversation-icon',
    hasJoined: true,
    isChannel: false,
  },
];

const chatClient = {
  getChannels: () => MOCK_CHANNELS,
  getConversations: () => MOCK_CONVERSATIONS,
};

describe('channels list saga', () => {
  it('sets status to fetching', async () => {
    await expectSaga(fetchChannels, { payload: '0x000000000000000000000000000000000000000A' })
      .put(setStatus(AsyncListStatus.Fetching))
      .provide([
        [
          matchers.call.fn(chat.get),
          chatClient,
        ],
      ])
      .run();
  });

  it('fetches channels', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetchChannels, { payload: id })
      .provide([
        [
          matchers.call.fn(chat.get),
          chatClient,
        ],
      ])
      .call(
        [
          chatClient,
          chatClient.getChannels,
        ],
        id
      )
      .run();
  });

  it('sets status to Idle', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    const {
      storeState: { channelsList },
    } = await expectSaga(fetchChannels, { payload: id })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(chat.get),
          chatClient,
        ],
      ])
      .run();

    expect(channelsList.status).toBe(AsyncListStatus.Idle);
  });

  it('adds channel ids to channelsList state', async () => {
    const ids = [
      'channel_0001',
      'channel_0002',
      'channel_0003',
    ];
    const {
      storeState: { channelsList },
    } = await expectSaga(fetchChannels, { payload: '0x000000000000000000000000000000000000000A' })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(chat.get),
          chatClient,
        ],
      ])
      .run();

    expect(channelsList.value).toStrictEqual(ids);
  });

  it('adds channels to normalized state', async () => {
    const id = 'channel-0099';
    const name = 'the channel';
    const icon = 'channel-icon';
    const category = 'channel-category';
    const unreadCount = 1;
    const hasJoined = true;
    const isChannel = true;

    const {
      storeState: { normalized },
    } = await expectSaga(fetchChannels, { payload: '0x000000000000000000000000000000000000000A' })
      .provide([
        [
          matchers.call.fn(chat.get),
          chatClient,
        ],
        [
          matchers.call.fn(chatClient.getChannels),
          [{ id, name, icon, category, unreadCount, hasJoined, isChannel }],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(normalized.channels[id]).toEqual(
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

    const { storeState } = await expectSaga(fetchChannelsAndConversations)
      .provide([
        [
          matchers.call(chat.get),
          chatClient,
        ],
        [
          matchers.call(
            [
              chatClient,
              chatClient.getChannels,
            ],
            rootDomainId
          ),
          [channel],
        ],
        [
          matchers.call([
            chatClient,
            chatClient.getConversations,
          ]),
          [conversation],
        ],
        [
          matchers.call.fn(delay),
          null,
        ],
      ])
      .withReducer(rootReducer)
      .withState({ zns: { value: { rootDomainId } } })
      .run();

    expect(denormalizeChannel(channel.id, storeState).name).toEqual('the channel');
    expect(denormalizeChannel(conversation.id, storeState).name).toEqual('the conversation');
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
});

describe(userLeftChannel, () => {
  it('Channel is removed from list when the current user has left a channel', async () => {
    const channelId = 'channel-id';
    const initialState = new StoreBuilder()
      .withCurrentUserId('current-user-id')
      .withChannelList({ id: 'one-channel' }, { id: channelId }, { id: 'other-channel' });

    const { storeState } = await expectSaga(userLeftChannel, channelId, 'current-user-id')
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.channelsList.value).toHaveLength(2);
    expect(storeState.channelsList.value).not.toContain(channelId);
  });

  it('does not remove channel if user is not the current user', async () => {
    const channelId = 'channel-id';
    const userId = 'current-user-id';
    const initialState = new StoreBuilder().withCurrentUserId(userId).withChannelList({ id: channelId });

    const { storeState } = await expectSaga(userLeftChannel, channelId, 'other-user-id')
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.channelsList.value).toHaveLength(1);
    expect(storeState.channelsList.value).toContain(channelId);
  });

  it('changes active conversation if user leaves (is removed from) the currently active one', async () => {
    const channelId = 'conversation-id';
    const userId = 'user-id';

    const initialState = new StoreBuilder()
      .withCurrentUserId(userId)
      .withConversationList(
        { id: 'conversation-1', lastMessage: { createdAt: 10000000 } as any },
        { id: channelId },
        { id: 'conversation-2', lastMessage: { createdAt: 10000001 } as any }
      )
      .withActiveConversation({ id: channelId })
      .build();

    const { storeState } = await expectSaga(userLeftChannel, channelId, userId)
      .withReducer(rootReducer, initialState)
      .run();

    expect(storeState.chat.activeConversationId).toEqual('conversation-2');
  });
});

describe(fetchConversations, () => {
  it('fetches direct messages', async () => {
    await expectSaga(fetchConversations)
      .provide([
        [
          matchers.call(chat.get),
          chatClient,
        ],
        [
          matchers.call([
            chatClient,
            chatClient.getConversations,
          ]),
          MOCK_CONVERSATIONS,
        ],
      ])
      .withReducer(rootReducer, { channelsList: { value: [] } } as RootState)
      .call(chat.get)
      .call([chatClient, chatClient.getConversations])
      .run();
  });

  it('announces conversations loaded', async () => {
    const conversationsChannelStub = multicastChannel();

    await expectSaga(fetchConversations)
      .provide([
        [
          matchers.call(chat.get),
          chatClient,
        ],
        [
          matchers.call([
            chatClient,
            chatClient.getConversations,
          ]),
          MOCK_CONVERSATIONS,
        ],
        [
          matchers.call.fn(conversationsChannel),
          conversationsChannelStub,
        ],
      ])
      .withReducer(rootReducer, { channelsList: { value: [] } } as RootState)
      .put(conversationsChannelStub, { loaded: true })
      .run();
  });

  it('retains conversations that are not CREATED', async () => {
    const optimisticChannel1 = { id: 'optimistic-id-1', conversationStatus: ConversationStatus.CREATING } as any;
    const optimisticChannel2 = { id: 'optimistic-id-2', conversationStatus: ConversationStatus.ERROR } as any;
    const fetchedChannel = { id: 'conversation-id' };

    const initialState = new StoreBuilder().withConversationList(optimisticChannel1, optimisticChannel2).build();

    const { storeState } = await expectSaga(fetchConversations)
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
});
