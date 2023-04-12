import { MOCK_CREATE_DIRECT_MESSAGE_RESPONSE } from './fixtures';
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import { call, race, take } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  fetchChannels as fetchChannelsApi,
  fetchConversations as fetchConversationsApi,
  createConversation as createConversationApi,
  uploadImage as uploadImageApi,
} from './api';

import {
  fetchChannels,
  fetchConversations,
  createConversation,
  fetchChannelsAndConversations,
  delay,
  startChannelsAndConversationsRefresh,
  clearChannelsAndConversations,
} from './saga';

import { SagaActionTypes, setStatus } from '.';
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

  it('creates conversation', async () => {
    const name = 'group';
    const userIds = ['7867766_7876Z2'];
    await expectSaga(createConversation, { payload: { userIds, name } })
      .provide([
        [
          matchers.call.fn(createConversationApi),
          MOCK_CHANNELS,
        ],
      ])
      .withReducer(rootReducer)
      .call(createConversationApi, userIds, name, '')
      .run();
  });

  it('handle existing conversation creation', async () => {
    const name = 'group';
    const userIds = ['7867766_7876Z2'];
    const {
      storeState: { channelsList, chat },
    } = await expectSaga(createConversation, { payload: { userIds, name } })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(createConversationApi),
          MOCK_CREATE_DIRECT_MESSAGE_RESPONSE,
        ],
      ])
      .withReducer(rootReducer)
      .call(createConversationApi, userIds, name, '')
      .run();

    expect(channelsList.value).toStrictEqual([MOCK_CREATE_DIRECT_MESSAGE_RESPONSE.id]);
    expect(chat.activeMessengerId).toStrictEqual(MOCK_CREATE_DIRECT_MESSAGE_RESPONSE.id);
  });

  it('uploads image when creating conversation', async () => {
    const name = 'group';
    const userIds = ['user'];
    const image = { some: 'file' };
    await expectSaga(createConversation, { payload: { userIds, name, image } })
      .provide([
        [
          matchers.call.fn(uploadImageApi),
          { url: 'image-url' },
        ],
        [
          matchers.call.fn(createConversationApi),
          MOCK_CHANNELS,
        ],
      ])
      .withReducer(rootReducer)
      .call(uploadImageApi, image)
      .call(createConversationApi, userIds, name, 'image-url')
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
      otherMembers: [],
      lastMessage: {},
      lastMessageCreatedAt: null,
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
      otherMembers: [],
      lastMessage: {},
      lastMessageCreatedAt: null,
      groupChannelType: '',
    };

    const {
      storeState: { normalized },
    } = await expectSaga(fetchChannelsAndConversations)
      .provide([
        [
          matchers.call(fetchChannelsApi, rootDomainId),
          [channel],
        ],
        [
          matchers.call.fn(fetchConversationsApi),
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

    expect(normalized.channels).toStrictEqual({
      [channel.id]: {
        ...channel,
      },
      [conversation.id]: {
        ...conversation,
      },
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
      .run(0);

    expect(normalized).toEqual({
      channels: {},
      notifications,
    });

    expect(channelsListResult).toEqual({ value: [] });
  });
});
