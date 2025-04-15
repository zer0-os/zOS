import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  markAllMessagesAsRead,
  markConversationAsRead,
  receiveChannel,
  unreadCountUpdated,
  publishUserTypingEvent,
  receivedRoomMembersTyping,
  receivedRoomMemberPowerLevelChanged,
  onAddLabel,
  onRemoveLabel,
  roomLabelChange,
} from './saga';

import { rootReducer } from '../reducer';
import { DefaultRoomLabels, denormalize as denormalizeChannel } from '../channels';
import { StoreBuilder } from '../test/store';
import { addRoomToLabel, chat, removeRoomFromLabel, sendTypingEvent } from '../../lib/chat';
import { getHistory } from '../../lib/browser';
import { PowerLevels } from '../../lib/chat/types';
import { userByMatrixIdSelector } from '../users/selectors';

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
      .call([mockChatClient, mockChatClient.markRoomAsRead], channelId)
      .run();
  });

  describe('markConversationAsReadIfActive', () => {
    it('does not mark all messages as read if conversation is not active', async () => {
      const channelId = 'channel-id';
      const state = new StoreBuilder()
        .withCurrentUserId(userId)
        .withActiveConversation({ id: 'other-channel-id', unreadCount: { total: 0, highlight: 0 } })
        .build();

      await expectSaga(markConversationAsRead, channelId)
        .provide([
          [matchers.call.fn(chat.get), mockChatClient],
          [matchers.call.fn(mockChatClient.markRoomAsRead), 200],
          [
            matchers.call.fn(getHistory),
            {
              push: jest.fn(),
              location: { pathname: '/conversation/other-channel-id' },
            },
          ],
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
    const updatedUnreadCount = { total: 4, highlight: 0 };

    const initialState = new StoreBuilder()
      .withConversationList({ id: channelId, unreadCount: { total: 3, highlight: 0 } })
      .build();
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
  it('updates an existing channel with new values', async () => {
    const initialState = new StoreBuilder()
      .withConversationList({
        id: 'room-id',
        moderatorIds: ['user-1'],
        name: 'Test Room',
        unreadCount: { total: 5, highlight: 0 },
      })
      .build();

    const { storeState } = await expectSaga(receiveChannel, {
      id: 'room-id',
      moderatorIds: ['user-1', 'user-2'],
      unreadCount: { total: 0, highlight: 0 },
    })
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.moderatorIds).toEqual(['user-1', 'user-2']);
    expect(channel.unreadCount).toEqual({ total: 0, highlight: 0 });
    expect(channel.name).toEqual('Test Room');
  });

  it('creates a new channel with default values if it does not exist', async () => {
    const { storeState } = await expectSaga(receiveChannel, {
      id: 'new-room-id',
      moderatorIds: ['user-1'],
      name: 'New Room',
    })
      .withReducer(rootReducer)
      .run();

    const channel = denormalizeChannel('new-room-id', storeState);
    expect(channel.moderatorIds).toEqual(['user-1']);
    expect(channel.name).toEqual('New Room');
    expect(channel.unreadCount).toEqual({ total: 0, highlight: 0 });
    expect(channel.messages).toEqual([]);
    expect(channel.otherMembers).toEqual([]);
  });
});

describe(onAddLabel, () => {
  it('calls addRoomToLabel with the label to be added', async () => {
    const initialState = new StoreBuilder()
      .withConversationList({ id: 'room-id', labels: [DefaultRoomLabels.FAMILY] })
      .build();

    await expectSaga(onAddLabel, { payload: { roomId: 'room-id', label: 'm.work' } })
      .withReducer(rootReducer, initialState)
      .provide([
        [matchers.call.fn(addRoomToLabel), undefined],
      ])
      .call(addRoomToLabel, 'room-id', DefaultRoomLabels.WORK)
      .run();
  });
});

describe(onRemoveLabel, () => {
  it('calls removeRoomFromLabel with the label to be removed', async () => {
    const initialState = new StoreBuilder()
      .withConversationList({ id: 'room-id', labels: [DefaultRoomLabels.WORK, DefaultRoomLabels.FAMILY] })
      .build();

    await expectSaga(onRemoveLabel, { payload: { roomId: 'room-id', label: DefaultRoomLabels.WORK } })
      .withReducer(rootReducer, initialState)
      .provide([
        [matchers.call.fn(removeRoomFromLabel), undefined],
      ])
      .call(removeRoomFromLabel, 'room-id', DefaultRoomLabels.WORK)
      .run();
  });
});

describe(roomLabelChange, () => {
  it('removes label from room', async () => {
    const initialState = new StoreBuilder()
      .withConversationList({ id: 'room-id', labels: [DefaultRoomLabels.WORK, DefaultRoomLabels.FAMILY] })
      .build();

    const { storeState } = await expectSaga(roomLabelChange, {
      payload: { roomId: 'room-id', labels: [DefaultRoomLabels.WORK] },
    })
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.labels).toEqual([DefaultRoomLabels.WORK]);
  });

  it('adds label to room', async () => {
    const initialState = new StoreBuilder()
      .withConversationList({ id: 'room-id', labels: [DefaultRoomLabels.WORK] })
      .build();

    const { storeState } = await expectSaga(roomLabelChange, {
      payload: { roomId: 'room-id', labels: [DefaultRoomLabels.WORK, DefaultRoomLabels.FAMILY] },
    })
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.labels).toEqual([DefaultRoomLabels.WORK, DefaultRoomLabels.FAMILY]);
  });
});

describe(publishUserTypingEvent, () => {
  it('sends typing event', async () => {
    const initialState = new StoreBuilder().withConversationList({ id: 'room-id' }).build();

    await expectSaga(publishUserTypingEvent, { payload: { roomId: 'room-id' } })
      .withReducer(rootReducer, initialState)
      .provide([
        [matchers.call.fn(sendTypingEvent), undefined],
      ])
      .call(sendTypingEvent, 'room-id', true)
      .run();
  });

  it('uses activeConversationId if roomId is not provided', async () => {
    const initialState = new StoreBuilder().withActiveConversation({ id: 'room-id' }).build();

    await expectSaga(publishUserTypingEvent, { payload: {} })
      .withReducer(rootReducer, initialState)
      .provide([
        [matchers.call.fn(sendTypingEvent), undefined],
      ])
      .call(sendTypingEvent, 'room-id', true)
      .run();
  });
});

describe(receivedRoomMembersTyping, () => {
  it('updates otherMembersTyping for room', async () => {
    const initialState = new StoreBuilder()
      .withConversationList({ id: 'room-id' })
      .withCurrentUser({ id: 'current-user-id', matrixId: 'matrix-id-3' })
      .withUsers(
        { userId: 'user-id-1', matrixId: '@user-id-1:matrix.org', firstName: 'Ashneer' },
        { userId: 'user-id-2', matrixId: '@user-id-2:matrix.org', firstName: 'Aman' },
        { userId: 'user-id-3', matrixId: '@user-id-3:matrix.org', firstName: 'Anupam' }
      )
      .build();

    const { storeState } = await expectSaga(receivedRoomMembersTyping, {
      payload: { roomId: 'room-id', userIds: ['@user-id-1:matrix.org', '@user-id-2:matrix.org'] },
    })
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.otherMembersTyping).toEqual(['Ashneer', 'Aman']);
  });

  it('does not add current user to otherMembersTyping', async () => {
    const initialState = new StoreBuilder()
      .withCurrentUser({
        id: 'currentUser-id',
        matrixId: 'current-user-matrix-id',
        profileSummary: { firstName: 'CurrentUser' },
      } as any)
      .withConversationList({ id: 'room-id' })
      .build();

    const { storeState } = await expectSaga(receivedRoomMembersTyping, {
      payload: { roomId: 'room-id', userIds: ['current-user-matrix-id'] },
    })
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.otherMembersTyping).toEqual([]);
  });
});

describe(receivedRoomMemberPowerLevelChanged, () => {
  it('adds a new moderator when their power level is set to Moderator', async () => {
    const initialState = new StoreBuilder()
      .withConversationList({
        id: 'room-id',
        moderatorIds: [],
        name: 'Test Room',
        unreadCount: { total: 0, highlight: 0 },
      })
      .withUsers({ userId: 'user-id-1', matrixId: 'matrix-id-1', firstName: 'Ashneer' })
      .build();

    const { storeState } = await expectSaga(receivedRoomMemberPowerLevelChanged, {
      payload: { roomId: 'room-id', matrixId: 'matrix-id-1', powerLevel: PowerLevels.Moderator },
    })
      .withReducer(rootReducer, initialState)
      .provide([
        [matchers.select(userByMatrixIdSelector, 'matrix-id-1'), { userId: 'user-id-1' }],
      ])
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.moderatorIds).toEqual(['user-id-1']);
  });

  it('does not add a moderator if they are already a moderator', async () => {
    const initialState = new StoreBuilder()
      .withConversationList({
        id: 'room-id',
        moderatorIds: ['user-id-1'],
        name: 'Test Room',
        unreadCount: { total: 0, highlight: 0 },
      })
      .withUsers({ userId: 'user-id-1', matrixId: 'matrix-id-1', firstName: 'Ashneer' })
      .build();

    const { storeState } = await expectSaga(receivedRoomMemberPowerLevelChanged, {
      payload: { roomId: 'room-id', matrixId: 'matrix-id-1', powerLevel: PowerLevels.Moderator },
    })
      .withReducer(rootReducer, initialState)
      .provide([
        [matchers.select(userByMatrixIdSelector, 'matrix-id-1'), { userId: 'user-id-1' }],
      ])
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.moderatorIds).toEqual(['user-id-1']);
  });

  it('removes a moderator when their power level is set to Viewer', async () => {
    const initialState = new StoreBuilder()
      .withConversationList({
        id: 'room-id',
        moderatorIds: ['user-id-1'],
        name: 'Test Room',
        unreadCount: { total: 0, highlight: 0 },
      })
      .withUsers({ userId: 'user-id-1', matrixId: 'matrix-id-1', firstName: 'Ashneer' })
      .build();

    const { storeState } = await expectSaga(receivedRoomMemberPowerLevelChanged, {
      payload: { roomId: 'room-id', matrixId: 'matrix-id-1', powerLevel: PowerLevels.Viewer },
    })
      .withReducer(rootReducer, initialState)
      .provide([
        [matchers.select(userByMatrixIdSelector, 'matrix-id-1'), { userId: 'user-id-1' }],
      ])
      .run();

    const channel = denormalizeChannel('room-id', storeState);
    expect(channel.moderatorIds).toEqual([]);
  });
});
