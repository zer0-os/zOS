import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  fetchUsersByChannelId,
  joinChannel as joinChannelAPI,
  markAllMessagesAsReadInChannel as markAllMessagesAsReadInChannelAPI,
} from './api';
import { joinChannel, loadUsers, markAllMessagesAsReadInChannel } from './saga';

import { rootReducer } from '..';

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
    const channelId = '248576469_9431f1076aa3e08783b2c2cf3b34df143442bc32';

    await expectSaga(loadUsers, { payload: { channelId } })
      .provide([
        [
          matchers.call.fn(fetchUsersByChannelId),
          usersResponse,
        ],
      ])
      .call(fetchUsersByChannelId, channelId)
      .run();
  });

  it('join channel and add hasJoined to channel state', async () => {
    const channelId = '248576469_9431f1076aa3e08783b2c2cf3b34df143442bc32';

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            hasJoined: false,
          },
        },
      },
    };

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(joinChannel, { payload: { channelId } })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [
          matchers.call.fn(joinChannelAPI),
          200,
        ],
      ])
      .call(joinChannelAPI, channelId)
      .run();

    expect(channels[channelId].hasJoined).toEqual(true);
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
    const channelId = '248576469_9431f1076aa3e08783b2c2cf3b34df143442bc32';

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

  it('mark all messages as read', async () => {
    const channelId = '236844224_56299bcd523ac9084181f2422d0d0cfe9df72db4';
    const userId = 'e41dc968-289b-4e92-889b-694bd7f2bc30';

    await expectSaga(markAllMessagesAsReadInChannel, { payload: { channelId, userId } })
      .provide([
        [
          matchers.call.fn(markAllMessagesAsReadInChannelAPI),
          200,
        ],
      ])
      .call(markAllMessagesAsReadInChannelAPI, channelId, userId)
      .run();
  });
});
