import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  fetchChannels,
  fetchDirectMessages as fetchDirectMessagesApi,
  createDirectMessage as createDirectMessageApi,
} from './api';
import { fetch, stopSyncChannels, unreadCountUpdated, fetchDirectMessages, createDirectMessage } from './saga';

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
    await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .put(setStatus(AsyncListStatus.Fetching))
      .provide([
        [
          matchers.call.fn(fetchChannels),
          MOCK_CHANNELS,
        ],
      ])
      .run();
  });

  it('fetches channels', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetch, { payload: id })
      .provide([
        [
          matchers.call.fn(fetchChannels),
          MOCK_CHANNELS,
        ],
      ])
      .call(fetchChannels, id)
      .run();
  });

  it('fetches direct messages', async () => {
    await expectSaga(fetchDirectMessages)
      .provide([
        [
          matchers.call.fn(fetchDirectMessagesApi),
          MOCK_CHANNELS,
        ],
      ])
      .call(fetchDirectMessagesApi)
      .run();
  });

  it('create direct messages', async () => {
    const userIds = ['7867766_7876Z2'];
    await expectSaga(createDirectMessage, { payload: { userIds } })
      .provide([
        [
          matchers.call.fn(createDirectMessageApi),
          MOCK_CHANNELS,
        ],
      ])
      .withReducer(rootReducer)
      .call(createDirectMessageApi, userIds)
      .run();
  });

  it('sets status to Idle', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    const {
      storeState: { channelsList },
    } = await expectSaga(fetch, { payload: id })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchChannels),
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
    } = await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchChannels),
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
    } = await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .provide([
        [
          matchers.call.fn(fetchChannels),
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

  it('set unreadCountUpdated on channels', async () => {
    const channel = {
      id: 'channel-1',
      name: 'the channel',
      icon: 'channel-icon',
      category: 'channel-category',
      unreadCount: 1,
      hasJoined: true,
      isChannel: false,
      otherMembers: [],
    };

    const directMessage = {
      id: 'direct-message-1',
      name: 'the direct message',
      icon: 'channel-icon',
      category: 'dm',
      unreadCount: 1,
      hasJoined: true,
      isChannel: true,
      otherMembers: [],
      lastMessage: {},
      lastMessageCreatedAt: undefined,
    };

    const {
      storeState: { normalized },
    } = await expectSaga(unreadCountUpdated, { payload: '0x000000000000000000000000000000000000000A' })
      .provide([
        [
          matchers.call.fn(fetchChannels),
          [channel],
        ],
        [
          matchers.call.fn(fetchDirectMessagesApi),
          [directMessage],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(normalized.channels).toStrictEqual({
      [channel.id]: {
        ...channel,
        groupChannelType: '',
        lastMessage: null,
        lastMessageCreatedAt: null,
      },
      [directMessage.id]: {
        ...directMessage,
        groupChannelType: '',
        lastMessageCreatedAt: null,
      },
    });
  });

  it('sets status to Stopped', async () => {
    const {
      storeState: { channelsList },
    } = await expectSaga(stopSyncChannels).withReducer(rootReducer).run();

    expect(channelsList.status).toBe(AsyncListStatus.Stopped);
  });
});
