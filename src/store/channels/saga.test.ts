import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  roomFavorited,
  markAllMessagesAsRead,
  markConversationAsRead,
  receiveChannel,
  onFavoriteRoom,
  unreadCountUpdated,
  onUnfavoriteRoom,
  roomUnfavorited,
} from './saga';

import { rootReducer } from '../reducer';
import { ConversationStatus, denormalize as denormalizeChannel } from '../channels';
import { StoreBuilder } from '../test/store';
import { addRoomToFavorites, chat, removeRoomFromFavorites } from '../../lib/chat';

const userId = 'user-id';

const mockChatClient = {
  markRoomAsRead: jest.fn().mockReturnValue(200),
};

describe('channels list saga', () => {
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
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.unreadCount).toEqual(updatedUnreadCount);
  });
});

describe(receiveChannel, () => {
  it('puts only the provided values if channel already exists', async () => {
    const initialChannel = { id: 'channel-id', unreadCount: 5, name: 'channel-name' };
    const initialState = new StoreBuilder().withConversationList(initialChannel);
    const { storeState } = await expectSaga(receiveChannel, { id: 'channel-id', unreadCount: 3 })
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel('channel-id', storeState);
    // Clean up because full comparison is important here
    delete channel.__denormalized;
    expect(channel).toEqual({ ...initialChannel, unreadCount: 3 });
  });

  it('defaults the conversation state if channel does not exist yet', async () => {
    const { storeState } = await expectSaga(receiveChannel, { id: 'channel-id', unreadCount: 3 })
      .withReducer(rootReducer)
      .run();

    const channel = denormalizeChannel('channel-id', storeState);
    // Clean up because full comparison is important here
    delete channel.__denormalized;
    expect(channel).toEqual({ ...CHANNEL_DEFAULTS, id: 'channel-id', unreadCount: 3 });
  });
});

describe(roomFavorited, () => {
  it('updates favorites for room', async () => {
    const initialState = new StoreBuilder().withConversationList({ id: 'room-id', isFavorite: false }).build();
    const { storeState } = await expectSaga(roomFavorited, {
      payload: { roomId: 'room-id' },
    })
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.isFavorite).toEqual(true);
  });
});

describe(onFavoriteRoom, () => {
  it('calls addRoomToFavorites when channel is not already favorite', async () => {
    const initialState = new StoreBuilder().withConversationList({ id: 'channel-id', isFavorite: false }).build();

    await expectSaga(onFavoriteRoom, { payload: { roomId: 'channel-id' } })
      .withReducer(rootReducer, initialState)
      .provide([
        [matchers.call.fn(addRoomToFavorites), undefined],
      ])
      .call(addRoomToFavorites, 'channel-id')
      .run();
  });
});

describe(roomUnfavorited, () => {
  it('updates unfavorite for room', async () => {
    const initialState = new StoreBuilder().withConversationList({ id: 'room-id', isFavorite: true }).build();
    const { storeState } = await expectSaga(roomUnfavorited, {
      payload: { roomId: 'room-id' },
    })
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.isFavorite).toEqual(false);
  });
});

describe(onUnfavoriteRoom, () => {
  it('calls removeRoomFromFavorites when channel is already favorite', async () => {
    const initialState = new StoreBuilder().withConversationList({ id: 'channel-id', isFavorite: true }).build();

    await expectSaga(onUnfavoriteRoom, { payload: { roomId: 'channel-id' } })
      .withReducer(rootReducer, initialState)
      .provide([
        [matchers.call.fn(removeRoomFromFavorites), undefined],
      ])
      .call(removeRoomFromFavorites, 'channel-id')
      .run();
  });
});

const CHANNEL_DEFAULTS = {
  optimisticId: '',
  name: '',
  messages: [],
  otherMembers: [],
  memberHistory: [],
  hasMore: true,
  createdAt: 0,
  lastMessage: null,
  unreadCount: 0,
  icon: '',
  isOneOnOne: true,
  hasLoadedMessages: false,
  conversationStatus: ConversationStatus.CREATED,
  messagesFetchStatus: null,
  adminMatrixIds: [],
  isFavorite: false,
};
