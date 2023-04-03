import { MOCK_CREATE_DIRECT_MESSAGE_RESPONSE } from './fixtures';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  fetchChannels as fetchChannelsApi,
  fetchConversations as fetchConversationsApi,
  createConversation as createConversationApi,
} from './api';

import { fetchChannels, fetchConversations, createConversation } from './saga';

import { setStatus } from '.';
import { rootReducer } from '..';
import { AsyncListStatus } from '../normalized';

const MOCK_CHANNELS = [
  { name: 'channel 1', id: 'channel_0001', url: 'channel_0001', icon: 'channel-icon', hasJoined: false },
  { name: 'channel 2', id: 'channel_0002', url: 'channel_0002', icon: 'channel-icon', hasJoined: false },
  { name: 'channel 3', id: 'channel_0003', url: 'channel_0003', icon: 'channel-icon', hasJoined: false },
];

describe('channels list saga', () => {
  it('sets status to fetching', async () => {
    await expectSaga(fetchChannels, { payload: '0x000000000000000000000000000000000000000A' })
      .put(setStatus(AsyncListStatus.Fetching))
      .provide([
        [
          matchers.call.fn(fetchChannelsApi),
          MOCK_CHANNELS,
        ],
      ])
      .run();
  });

  it('fetches channels', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetchChannels, { payload: id })
      .provide([
        [
          matchers.call.fn(fetchChannelsApi),
          MOCK_CHANNELS,
        ],
      ])
      .call(fetchChannelsApi, id)
      .run();
  });

  it('fetches direct messages', async () => {
    await expectSaga(fetchConversations)
      .provide([
        [
          matchers.call.fn(fetchConversationsApi),
          MOCK_CHANNELS,
        ],
      ])
      .call(fetchConversationsApi)
      .run();
  });

  it('create direct messages', async () => {
    const userIds = ['7867766_7876Z2'];
    await expectSaga(createConversation, { payload: { userIds } })
      .provide([
        [
          matchers.call.fn(createConversationApi),
          MOCK_CHANNELS,
        ],
      ])
      .withReducer(rootReducer)
      .call(createConversationApi, userIds)
      .run();
  });

  it('handle existing chat direct messages creation', async () => {
    const userIds = ['7867766_7876Z2'];
    const {
      storeState: { channelsList, chat },
    } = await expectSaga(createConversation, { payload: { userIds } })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(createConversationApi),
          MOCK_CREATE_DIRECT_MESSAGE_RESPONSE,
        ],
      ])
      .withReducer(rootReducer)
      .call(createConversationApi, userIds)
      .run();

    expect(channelsList.value).toStrictEqual([MOCK_CREATE_DIRECT_MESSAGE_RESPONSE.id]);
    expect(chat.activeMessengerId).toStrictEqual(MOCK_CREATE_DIRECT_MESSAGE_RESPONSE.id);
  });

  it('sets status to Idle', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    const {
      storeState: { channelsList },
    } = await expectSaga(fetchChannels, { payload: id })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchChannelsApi),
          MOCK_CHANNELS,
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
          matchers.call.fn(fetchChannelsApi),
          MOCK_CHANNELS,
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
          matchers.call.fn(fetchChannelsApi),
          [{ id, name, icon, category, unreadCount, hasJoined, isChannel }],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(normalized.channels[id]).toStrictEqual({
      id,
      name,
      icon,
      category,
      unreadCount,
      hasJoined,
      isChannel,
      otherMembers: [],
      groupChannelType: '',
      lastMessage: null,
      lastMessageCreatedAt: null,
    });
  });

  // xit('set unreadCountUpdated on channels', async () => {
  //   const channel = {
  //     id: 'channel-1',
  //     name: 'the channel',
  //     icon: 'channel-icon',
  //     category: 'channel-category',
  //     unreadCount: 1,
  //     hasJoined: true,
  //     isChannel: true,
  //     otherMembers: [],
  //   };
  //
  //   const directMessage = {
  //     id: 'direct-message-1',
  //     name: 'the direct message',
  //     icon: 'channel-icon',
  //     category: 'dm',
  //     unreadCount: 1,
  //     hasJoined: true,
  //     isChannel: false,
  //     otherMembers: [],
  //     lastMessage: {},
  //     lastMessageCreatedAt: undefined,
  //   };
  //
  //   const {
  //     storeState: { normalized },
  //   } = await expectSaga(unreadCountUpdated, { payload: '0x000000000000000000000000000000000000000A' })
  //     .provide([
  //       [
  //         matchers.call.fn(fetchChannelsApi),
  //         [channel],
  //       ],
  //       [
  //         matchers.call.fn(fetchConversationsApi),
  //         [directMessage],
  //       ],
  //     ])
  //     .withReducer(rootReducer)
  //     .run();
  //
  //   expect(normalized.channels).toStrictEqual({
  //     [channel.id]: {
  //       ...channel,
  //       groupChannelType: '',
  //       lastMessage: null,
  //       lastMessageCreatedAt: null,
  //     },
  //     [directMessage.id]: {
  //       ...directMessage,
  //       groupChannelType: '',
  //       lastMessageCreatedAt: null,
  //     },
  //   });
  // });

  // xit('sets status to Stopped', async () => {
  //   const {
  //     storeState: { channelsList },
  //   } = await expectSaga(stopChannelsAutoRefresh).withReducer(rootReducer).run();
  //
  //   expect(channelsList.status).toBe(AsyncListStatus.Stopped);
  // });
});
