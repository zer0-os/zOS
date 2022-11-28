import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchUsersByChannelId, joinChannel as joinChannelAPI } from './api';
import { channelIdPrefix, joinChannel, loadUsers } from './saga';

import { rootReducer } from '..';
import { fetchChannels } from '../channels-list/api';

const MOCK_CHANNELS = [
  { name: 'channel 1', url: 'channel_0001', icon: 'channel-icon', hasJoined: false },
  { name: 'channel 2', url: 'channel_0002', icon: 'channel-icon', hasJoined: false },
  { name: 'channel 3', url: 'channel_0003', icon: 'channel-icon', hasJoined: false },
];

describe('channels list saga', () => {
  const usersResponse = [
    {
      id: 'the-first-id',
      firstName: 'the first name',
    },
    {
      id: 'the-second-id',
      firstName: 'the second name',
    },
  ];

  it('load users', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    await expectSaga(loadUsers, { payload: { channelId } })
      .provide([
        [
          matchers.call.fn(fetchUsersByChannelId),
          usersResponse,
        ],
      ])
      .call(fetchUsersByChannelId, channelIdPrefix + channelId)
      .run();
  });

  it('join channel', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    await expectSaga(joinChannel, { payload: { channelId } })
      .provide([
        [
          matchers.call.fn(joinChannelAPI),
          200,
        ],
        [
          matchers.call.fn(fetchChannels),
          MOCK_CHANNELS,
        ],
      ])
      .call(joinChannelAPI, channelId)
      .run();
  });

  it('adds users ids to channels state', async () => {
    const channelId = 'channel-id';

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            users: [
              'old-user-id',
            ],
          },
        },
      },
    };

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(loadUsers, { payload: { channelId } })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [
          matchers.call.fn(fetchUsersByChannelId),
          usersResponse,
        ],
      ])
      .run();

    expect(channels[channelId].users).toStrictEqual([
      'the-first-id',
      'the-second-id',
    ]);
  });

  it('adds users to normalized state', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';

    const {
      storeState: {
        normalized: { users },
      },
    } = await expectSaga(loadUsers, { payload: { channelId } })
      .provide([
        [
          matchers.call.fn(fetchUsersByChannelId),
          usersResponse,
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(users).toMatchObject({
      'the-first-id': { id: 'the-first-id', firstName: 'the first name' },
      'the-second-id': { id: 'the-second-id', firstName: 'the second name' },
    });
  });
});
