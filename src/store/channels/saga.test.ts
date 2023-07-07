import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  joinChannel as joinChannelAPI,
  markAllMessagesAsReadInChannel as markAllMessagesAsReadInChannelAPI,
} from './api';
import { joinChannel, markAllMessagesAsRead, unreadCountUpdated } from './saga';

import { rootReducer } from '../reducer';

describe('channels list saga', () => {
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

  it('mark all messages as read', async () => {
    const channelId = '236844224_56299bcd523ac9084181f2422d0d0cfe9df72db4';
    const userId = 'e41dc968-289b-4e92-889b-694bd7f2bc30';

    await expectSaga(markAllMessagesAsRead, channelId, userId)
      .provide([
        [
          matchers.call.fn(markAllMessagesAsReadInChannelAPI),
          200,
        ],
      ])
      .call(markAllMessagesAsReadInChannelAPI, channelId, userId)
      .run();
  });

  it('handle unread count update', async () => {
    const channelId = 'channel-id';
    const updatedUnreadCount = 4;

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            unreadCount: 3,
          },
        },
      },
    };

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(unreadCountUpdated, { payload: { channelId, unreadCount: updatedUnreadCount } })
      .withReducer(rootReducer, initialState as any)

      .run();

    expect(channels[channelId].unreadCount).toEqual(updatedUnreadCount);
  });
});
