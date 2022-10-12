import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetch } from './saga';
import { fetchUsersByChannelId } from './api';

import { rootReducer } from '..';
import { channelIdPrefix } from '../channels-list/saga';

describe('Users saga', () => {
  const usersResponse = [
    {
      userId: 'the-first-id',
      firstName: 'the first name',
    },
    {
      userId: 'the-second-id',
      firstName: 'the second name',
    },
  ];
  const channelId = '0x000000000000000000000000000000000000000A';

  it('fetch users', async () => {
    await expectSaga(fetch, { payload: { channelId } })
      .provide([
        [
          matchers.call.fn(fetchUsersByChannelId),
          usersResponse,
        ],
      ])
      .call(fetchUsersByChannelId, channelIdPrefix + channelId)
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
    } = await expectSaga(fetch, { payload: { channelId } })
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
    const {
      storeState: {
        normalized: { users },
      },
    } = await expectSaga(fetch, { payload: { channelId: '0x000000000000000000000000000000000000000A' } })
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
