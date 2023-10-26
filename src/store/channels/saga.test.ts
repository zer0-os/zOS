import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { joinChannel as joinChannelAPI } from './api';
import {
  joinChannel,
  markAllMessagesAsRead,
  markChannelAsRead,
  markConversationAsRead,
  unreadCountUpdated,
} from './saga';
import { fetch as fetchMessages } from '../messages/saga';

import { rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';
import { denormalize as denormalizeChannel } from '../channels';
import { StoreBuilder } from '../test/store';
import { chat } from '../../lib/chat';

const userId = 'user-id';

const mockChatClient = {
  markRoomAsRead: jest.fn().mockReturnValue(200),
};

describe('channels list saga', () => {
  it('join channel and add hasJoined to channel state', async () => {
    const channelId = '248576469_9431f1076aa3e08783b2c2cf3b34df143442bc32';

    const initialState = new StoreBuilder().withChannelList({ id: channelId, hasJoined: false }).build();

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
        [matchers.call.fn(chat.get), mockChatClient],
        [matchers.call.fn(mockChatClient.markRoomAsRead), 200],
      ])
      .call(chat.get)
      .call([mockChatClient, mockChatClient.markRoomAsRead], channelId, userId)
      .run();
  });

  describe('markChannelAsReadIfActive', () => {
    it('marks all messages as read', async () => {
      const channelId = '236844224_56299bcd523ac9084181f2422d0d0cfe9df72db4';
      const userId = 'e41dc968-289b-4e92-889b-694bd7f2bc30';

      const state = new StoreBuilder()
        .inWindowedMode()
        .withCurrentUserId(userId)
        .withActiveChannel({ id: channelId, unreadCount: 3 })
        .build();

      await expectSaga(markChannelAsRead, channelId)
        .provide([
          [matchers.call.fn(chat.get), mockChatClient],
          [matchers.call.fn(mockChatClient.markRoomAsRead), 200],
        ])
        .withReducer(rootReducer, state)
        .call(markAllMessagesAsRead, channelId, userId)
        .run();
    });

    it('does not mark all messages as read if messenger is fullscreen', async () => {
      const channelId = 'channel-id';
      const state = new StoreBuilder()
        .inFullScreenMessenger()
        .withCurrentUserId(userId)
        .withActiveChannel({ id: channelId, unreadCount: 3 })
        .build();

      await expectSaga(markChannelAsRead, channelId)
        .provide([
          [matchers.call.fn(chat.get), mockChatClient],
          [matchers.call.fn(mockChatClient.markRoomAsRead), 200],
        ])
        .withReducer(rootReducer, state)
        .not.call(markAllMessagesAsRead, channelId, userId)
        .run();
    });

    it('does not mark all messages as read if unreadCount is 0', async () => {
      const channelId = 'channel-id';
      const state = new StoreBuilder()
        .inWindowedMode()
        .withCurrentUserId(userId)
        .withActiveChannel({ id: channelId, unreadCount: 0 })
        .build();

      await expectSaga(markChannelAsRead, channelId)
        .provide([
          [matchers.call.fn(chat.get), mockChatClient],
          [matchers.call.fn(mockChatClient.markRoomAsRead), 200],
        ])
        .withReducer(rootReducer, state)
        .not.call(markAllMessagesAsRead, channelId, userId)
        .run();
    });
  });

  describe('markConversationAsReadIfActive', () => {
    it('mark all messages as read', async () => {
      const channelId = 'channel-id';
      const state = new StoreBuilder()
        .withCurrentUserId(userId)
        .withActiveConversation({ id: channelId, unreadCount: 3 })
        .build();

      await expectSaga(markConversationAsRead, channelId)
        .provide([
          [matchers.call.fn(chat.get), mockChatClient],
          [matchers.call.fn(mockChatClient.markRoomAsRead), 200],
        ])
        .withReducer(rootReducer, state)
        .call(markAllMessagesAsRead, channelId, userId)
        .run();
    });

    it('does not mark all messages as read if unreadCount is 0', async () => {
      const channelId = 'channel-id';
      const state = new StoreBuilder()
        .withCurrentUserId(userId)
        .withActiveConversation({ id: channelId, unreadCount: 0 })
        .build();

      await expectSaga(markConversationAsRead, channelId)
        .provide([
          [matchers.call.fn(chat.get), mockChatClient],
          [matchers.call.fn(mockChatClient.markRoomAsRead), 200],
        ])
        .withReducer(rootReducer, state)
        .not.call(markAllMessagesAsRead, channelId, userId)
        .run();
    });
  });
});

describe(unreadCountUpdated, () => {
  it('updates the unread count for the channel', async () => {
    const channelId = 'channel-id';
    const updatedUnreadCount = 4;

    const initialState = new StoreBuilder().withConversationList({ id: channelId, unreadCount: 3 }).build();
    const { storeState } = await expectSaga(unreadCountUpdated, {
      payload: { channelId, unreadCount: updatedUnreadCount },
    })
      .provide([stubResponse(matchers.spawn.fn(fetchMessages), null)])
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.unreadCount).toEqual(updatedUnreadCount);
  });

  it('fetches messages for channel if they have not been fetched previously', async () => {
    const channelId = 'channel-id';

    const initialState = new StoreBuilder().withConversationList({ id: channelId, hasLoadedMessages: false }).build();

    await expectSaga(unreadCountUpdated, {
      payload: { channelId, unreadCount: 2 },
    })
      .provide([stubResponse(matchers.spawn.fn(fetchMessages), null)])
      .withReducer(rootReducer, initialState)
      .spawn(fetchMessages, { payload: { channelId } })
      .run();
  });

  it('does not fetch messages if the channel has already loaded once', async () => {
    const channelId = 'channel-id';

    const initialState = new StoreBuilder().withConversationList({ id: channelId, hasLoadedMessages: true }).build();

    await expectSaga(unreadCountUpdated, {
      payload: { channelId, unreadCount: 2 },
    })
      .provide([stubResponse(matchers.spawn.fn(fetchMessages), null)])
      .withReducer(rootReducer, initialState)
      .not.spawn.fn(fetchMessages)
      .run();
  });
});
