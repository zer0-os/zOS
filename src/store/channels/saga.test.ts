import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  joinChannel as joinChannelAPI,
  markAllMessagesAsReadInChannel as markAllMessagesAsReadInChannelAPI,
} from './api';
import {
  joinChannel,
  markAllMessagesAsRead,
  markChannelAsReadIfActive,
  markConversationAsReadIfActive,
  unreadCountUpdated,
} from './saga';

import { RootState, rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';
import { denormalize as denormalizeChannel, normalize as normalizeChannel } from '../channels';

const channelId = 'channel-id';
const userId = 'user-id';

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
      .provide([stubResponse(matchers.call.fn(markAllMessagesAsReadInChannelAPI), 200)])
      .call(markAllMessagesAsReadInChannelAPI, channelId, userId)
      .run();
  });

  describe('markChannelAsReadIfActive', () => {
    it('marks all messages as read', async () => {
      const channelId = '236844224_56299bcd523ac9084181f2422d0d0cfe9df72db4';
      const userId = 'e41dc968-289b-4e92-889b-694bd7f2bc30';

      const state = initialState(
        channelId,
        userId,
        { unreadCount: 3 },
        { isMessengerFullScreen: false, activeChannelId: channelId }
      );

      await expectSaga(markChannelAsReadIfActive, channelId)
        .provide([stubResponse(matchers.call.fn(markAllMessagesAsReadInChannelAPI), 200)])
        .withReducer(rootReducer, state)
        .call(markAllMessagesAsRead, channelId, userId)
        .run();
    });

    it('does not mark all messages as read if channelId is not equal to activeChannelId', async () => {
      const state = initialState(
        channelId,
        userId,
        { unreadCount: 3 },
        { activeChannelId: 'some-other-channel-id', isMessengerFullScreen: false }
      );

      await expectSaga(markChannelAsReadIfActive, channelId)
        .provide([stubResponse(matchers.call.fn(markAllMessagesAsReadInChannelAPI), 200)])
        .withReducer(rootReducer, state)
        .not.call(markAllMessagesAsRead, channelId, userId)
        .run();
    });

    it('does not mark all messages as read if messenger is not fullscreen', async () => {
      const state = initialState(
        channelId,
        userId,
        { unreadCount: 3 },
        { activeChannelId: channelId, isMessengerFullScreen: true }
      );

      await expectSaga(markChannelAsReadIfActive, channelId)
        .provide([stubResponse(matchers.call.fn(markAllMessagesAsReadInChannelAPI), 200)])
        .withReducer(rootReducer, state)
        .not.call(markAllMessagesAsRead, channelId, userId)
        .run();
    });

    it('does not mark all messages as read if unreadCount is 0', async () => {
      const state = initialState(
        channelId,
        userId,
        { unreadCount: 0 },
        { activeChannelId: channelId, isMessengerFullScreen: false }
      );

      await expectSaga(markChannelAsReadIfActive, channelId)
        .provide([stubResponse(matchers.call.fn(markAllMessagesAsReadInChannelAPI), 200)])
        .withReducer(rootReducer, state)
        .not.call(markAllMessagesAsRead, channelId, userId)
        .run();
    });
  });

  describe('markConversationAsReadIfActive', () => {
    it('mark all messages as read', async () => {
      const state = initialState(
        channelId,
        userId,
        { unreadCount: 3 },
        { isMessengerFullScreen: true, activeConversationId: channelId }
      );

      await expectSaga(markConversationAsReadIfActive, channelId)
        .provide([stubResponse(matchers.call.fn(markAllMessagesAsReadInChannelAPI), 200)])
        .withReducer(rootReducer, state)
        .call(markAllMessagesAsRead, channelId, userId)
        .run();
    });

    it('does not mark all messages as read if channelId is not equal to activeConversationId', async () => {
      const state = initialState(
        channelId,
        userId,
        { unreadCount: 3 },
        { activeConversationId: 'some-other-channel-id', isMessengerFullScreen: true }
      );

      await expectSaga(markConversationAsReadIfActive, channelId)
        .provide([stubResponse(matchers.call.fn(markAllMessagesAsReadInChannelAPI), 200)])
        .withReducer(rootReducer, state)
        .not.call(markAllMessagesAsRead, channelId, userId)
        .run();
    });

    it('does not mark all messages as read if unreadCount is 0', async () => {
      const state = initialState(
        channelId,
        userId,
        { unreadCount: 0 },
        { isMessengerFullScreen: true, activeConversationId: channelId }
      );

      await expectSaga(markConversationAsReadIfActive, channelId)
        .provide([stubResponse(matchers.call.fn(markAllMessagesAsReadInChannelAPI), 200)])
        .withReducer(rootReducer, state)
        .not.call(markAllMessagesAsRead, channelId, userId)
        .run();
    });
  });
});

describe(unreadCountUpdated, () => {
  it('handle unread count update', async () => {
    const channelId = 'channel-id';
    const updatedUnreadCount = 4;

    const initialState = existingChannelState({ id: channelId, unreadCount: 3 });
    const { storeState } = await expectSaga(unreadCountUpdated, {
      payload: { channelId, unreadCount: updatedUnreadCount },
    })
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.unreadCount).toEqual(updatedUnreadCount);
  });
});

function initialState(
  channelId = 'channel-id',
  userId = 'user-id',
  channel = {},
  { isMessengerFullScreen = false, activeChannelId = '', activeConversationId = '' }
) {
  const initialState = {
    ...existingChannelState({ id: channelId, ...channel }),
    authentication: {
      user: { data: { id: userId } },
    },
    layout: {
      value: {
        isMessengerFullScreen,
      },
    },
    chat: {
      activeChannelId,
      activeConversationId,
    },
  };

  return initialState as any;
}

function existingChannelState(channel) {
  const normalized = normalizeChannel(channel);
  return {
    normalized: {
      ...normalized.entities,
    },
  } as RootState;
}
