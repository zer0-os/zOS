import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  receiveDelete,
  editMessage,
  clearMessages,
  sendBrowserNotification,
  receiveUpdateMessage,
  replaceOptimisticMessage,
  onMessageEmojiReactionChange,
  updateMessageEmojiReaction,
  sendEmojiReaction,
} from './saga';

import { rootReducer } from '../reducer';
import { mapMessage, send as sendBrowserMessage } from '../../lib/browser';
import { call } from 'redux-saga/effects';
import { StoreBuilder } from '../test/store';
import { MessageSendStatus } from '.';
import { chat, getMessageEmojiReactions, sendEmojiReactionEvent } from '../../lib/chat';
import { NotifiableEventType } from '../../lib/chat/matrix/types';
import { DefaultRoomLabels } from '../channels';

const chatClient = {
  editMessage: (_channelId: string, _messageId: string, _message: string, _mentionedUserIds: string[]) => ({}),
};

describe('messages saga', () => {
  it('sends a browser notification for a conversation when event type is notifiable', async () => {
    const eventData = {
      id: 8667728016,
      sender: { userId: 'sender-id' },
      createdAt: 1678861267433,
      type: NotifiableEventType.RoomMessage,
    };

    const initialState = {
      authentication: { user: { data: { id: 'test-user-id', matrixId: 'test-user-matrix-id' } } },
    };

    await expectSaga(sendBrowserNotification, eventData as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .call(sendBrowserMessage, mapMessage(eventData as any))
      .withState(initialState)
      .run();
  });

  it('does not send a browser notification for a conversation when event type is not a message event', async () => {
    const eventData = {
      id: 8667728016,
      sender: { userId: 'sender-id' },
      createdAt: 1678861267433,
      type: '',
    };

    const initialState = {
      authentication: { user: { data: { id: 'test-user-id', matrixId: 'test-user-matrix-id' } } },
    };

    await expectSaga(sendBrowserNotification, eventData as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .not.call(sendBrowserMessage, mapMessage(eventData as any))
      .withState(initialState)
      .run();
  });

  it('does not send a browser notification when the user is the sender', async () => {
    const user = {
      id: 'the-user-id',
      matrixId: 'the-user-matrix-id',
    };

    const eventData = {
      id: 8667728016,
      sender: { userId: user.matrixId },
      createdAt: 1678861267433,
    };

    const initialState = {
      authentication: { user: { data: user } },
    };

    await expectSaga(sendBrowserNotification, eventData as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .not.call(sendBrowserMessage, mapMessage(eventData as any))
      .withState(initialState)
      .run();
  });

  it('sends a browser notification when the room is NOT muted', async () => {
    const eventData = {
      id: 8667728016,
      sender: { userId: 'sender-id' },
      createdAt: 1678861267433,
      type: NotifiableEventType.RoomMessage,
      roomId: 'room-id-1',
    };

    const initialState = {
      authentication: { user: { data: { id: 'test-user-id', matrixId: 'test-user-matrix-id' } } },
      normalized: {
        channels: {
          'room-id-1': { labels: [] },
        },
      },
    };

    await expectSaga(sendBrowserNotification, eventData as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .call(sendBrowserMessage, mapMessage(eventData as any))
      .withState(initialState)
      .run();
  });

  it('does not send a browser notification when the room is muted', async () => {
    const eventData = {
      id: 8667728016,
      sender: { userId: 'sender-id' },
      createdAt: 1678861267433,
      type: NotifiableEventType.RoomMessage,
      roomId: 'room-id-1',
    };

    const initialState = {
      authentication: { user: { data: { id: 'test-user-id', matrixId: 'test-user-matrix-id' } } },
      normalized: {
        channels: {
          'room-id-1': { labels: [DefaultRoomLabels.MUTE] },
        },
      },
    };

    await expectSaga(sendBrowserNotification, eventData as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .not.call(sendBrowserMessage, mapMessage(eventData as any))
      .withState(initialState)
      .run();
  });

  it('does not send a browser notification when the room is archived', async () => {
    const eventData = {
      id: 8667728016,
      sender: { userId: 'sender-id' },
      createdAt: 1678861267433,
      type: NotifiableEventType.RoomMessage,
      roomId: 'room-id-1',
    };

    const initialState = {
      authentication: { user: { data: { id: 'test-user-id', matrixId: 'test-user-matrix-id' } } },
      normalized: {
        channels: {
          'room-id-1': { labels: [DefaultRoomLabels.ARCHIVED] },
        },
      },
    };

    await expectSaga(sendBrowserNotification, eventData as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .not.call(sendBrowserMessage, mapMessage(eventData as any))
      .withState(initialState)
      .run();
  });

  it('edit message', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const message = 'update message';
    const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];
    const messages = [
      { id: 1, message: 'message_0001', createdAt: 10000000007 },
      { id: 2, message: 'message_0002', createdAt: 10000000008 },
      { id: 3, message: 'message_0003', createdAt: 10000000009 },
    ];
    const messageIdToEdit = messages[1].id;

    await expectSaga(editMessage, { payload: { channelId, messageId: messageIdToEdit, message, mentionedUserIds } })
      .provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.editMessage), { status: 200 }],
      ])
      .withReducer(rootReducer)
      .call([chatClient, chatClient.editMessage], channelId, messageIdToEdit, message, mentionedUserIds, undefined)
      .run();
  });

  it('receive delete message', async () => {
    const channelId = '280251425_833da2e2748a78a747786a9de295dd0c339a2d95';
    const messages = [
      { id: 1, message: 'This is my first message' },
      { id: 2, message: 'I will delete this message' },
      { id: 3, message: 'This is my third message' },
    ];

    const messageIdToDelete = messages[1].id;

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            messages: messages.map((m) => m.id),
          },
        },
        messages,
      },
    };

    const {
      storeState: { normalized },
    } = await expectSaga(receiveDelete, {
      payload: { channelId, messageId: messageIdToDelete },
    })
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(normalized.channels[channelId].messages).toEqual([
      messages[0].id,
      messages[2].id,
    ]);
  });

  it('removes the messages', async () => {
    const messages = { 'id-one': { id: 'id-one', name: 'this should be removed' } };
    const channels = { 'id-two': { id: 'id-two', name: 'do not remove this one' } };

    const {
      storeState: { normalized },
    } = await expectSaga(clearMessages)
      .withReducer(rootReducer)
      .withState({
        normalized: { messages, channels },
      })
      .run();

    expect(normalized).toEqual({
      messages: {},
      channels,
    });
  });
});

describe(receiveUpdateMessage, () => {
  it('updates the messages', async () => {
    const message = {
      id: 8667728016,
      message: 'original message',
      parentMessageText: null,
      createdAt: 1678861267433,
      updatedAt: 0,
    };
    const editedMessage = {
      id: 8667728016,
      message: 'edited message',
      parentMessageText: null,
      createdAt: 1678861267433,
      updatedAt: 1678861290000,
    };

    const initialState = new StoreBuilder().withConversationList({ id: 'channel-1', messages: [message] as any });

    const { storeState } = await expectSaga(receiveUpdateMessage, {
      payload: { channelId: 'channel-1', message: editedMessage },
    })
      .provide([[call(getMessageEmojiReactions, 'channel-1'), [{}]]])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.normalized.messages).toEqual({ 8667728016: editedMessage });
  });

  it('adds the reactions if they exist', async () => {
    const message = { id: 8667728016, message: 'original message' };
    const editedMessage = { id: 8667728016, message: 'edited message with reaction' };
    const reactions = [
      { eventId: 8667728016, key: '😂' },
      { eventId: 8667728016, key: '👍' },
    ];

    const expectedReactions = {
      '😂': 1,
      '👍': 1,
    };

    const initialState = new StoreBuilder().withConversationList({ id: 'channel-1', messages: [message] as any });

    const { storeState } = await expectSaga(receiveUpdateMessage, {
      payload: { channelId: 'channel-1', message: editedMessage },
    })
      .provide([
        [call(getMessageEmojiReactions, 'channel-1'), reactions],
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.normalized.messages[message.id]).toEqual({ ...editedMessage, reactions: expectedReactions });
  });
});

describe(replaceOptimisticMessage, () => {
  it('returns null if there is no optimisticId on the new message', async () => {
    const newMessage = {
      id: 'new-message',
      isAdmin: false,
      createdAt: 0,
      updatedAt: 0,
      sender: {
        userId: 'test',
        matrixId: 'test',
        firstName: 'test',
        lastName: 'test',
        profileImage: '',
        profileId: '',
        primaryZID: '',
      },
      mentionedUsers: [],
      hidePreview: false,
      sendStatus: MessageSendStatus.SUCCESS,
      isPost: false,
    };
    const { returnValue } = await expectSaga(replaceOptimisticMessage, [], newMessage).run();

    expect(returnValue).toEqual(null);
  });

  it('appends the message and sets send status to success if there is no message identified by the optimisticId', async () => {
    const currentMessages = ['message-1', 'message-2'];
    const newMessage = {
      id: 'new-message',
      optimisticId: 'optimistic-id',
      isAdmin: false,
      createdAt: 0,
      updatedAt: 0,
      sender: {
        userId: 'test',
        matrixId: 'test',
        firstName: 'test',
        lastName: 'test',
        profileImage: '',
        profileId: '',
        primaryZID: '',
      },
      mentionedUsers: [],
      hidePreview: false,
      sendStatus: MessageSendStatus.SUCCESS,
      isPost: false,
    };

    const { returnValue } = await expectSaga(replaceOptimisticMessage, currentMessages, newMessage).run();

    expect(returnValue).toEqual([...currentMessages, { ...newMessage, sendStatus: MessageSendStatus.SUCCESS }]);
  });

  it('returns message list with replaced message and success status', async () => {
    const currentMessages = ['message-1', 'optimistic-id', 'message-2'];
    const oldMessages = [
      { id: 'message-1' },
      { id: 'optimistic-id', optimisticId: 'optimistic-id', createdAt: 1234567890 },
      { id: 'message-2' },
    ] as any;
    const newMessage = {
      id: 'new-message',
      optimisticId: 'optimistic-id',
      isAdmin: false,
      createdAt: 0,
      updatedAt: 0,
      sender: {
        userId: 'test',
        matrixId: 'test',
        firstName: 'test',
        lastName: 'test',
        profileImage: '',
        profileId: '',
        primaryZID: '',
      },
      mentionedUsers: [],
      hidePreview: false,
      sendStatus: MessageSendStatus.SUCCESS,
      isPost: false,
    };
    const initialState = new StoreBuilder().withConversationList({ id: 'channel-id', messages: oldMessages });

    const { returnValue } = await expectSaga(replaceOptimisticMessage, currentMessages, newMessage)
      .withReducer(rootReducer, initialState.build())
      .run();

    const expectedNewMessage = { ...newMessage, createdAt: 1234567890, sendStatus: MessageSendStatus.SUCCESS };
    expect(returnValue).toEqual(['message-1', expectedNewMessage, 'message-2']);
  });
});

describe('onMessageEmojiReactionChange', () => {
  it('calls updateMessageEmojiReaction with the correct arguments', async () => {
    const roomId = 'room-id';
    const reaction = { eventId: 'message-1', key: '❤️' };

    await expectSaga(onMessageEmojiReactionChange, { payload: { roomId, reaction } })
      .provide([
        [matchers.call.fn(updateMessageEmojiReaction), undefined],
      ])
      .call(updateMessageEmojiReaction, roomId, reaction)
      .run();
  });
});

describe('updateMessageEmojiReaction', () => {
  it('updates the message with the new reaction', async () => {
    const roomId = 'room-id';
    const reaction = { eventId: 'message-1', key: '❤️' };
    const messages = [
      { id: 'message-1', reactions: { '👍': 1 } },
      { id: 'message-2', reactions: {} },
    ];

    const initialState = {
      normalized: {
        messages: {
          'message-1': messages[0],
          'message-2': messages[1],
        },
        channels: {
          [roomId]: {
            id: roomId,
            messages: ['message-1', 'message-2'],
          },
        },
      },
    };

    const updatedMessages = [
      { id: 'message-1', reactions: { '👍': 1, '❤️': 1 } },
      { id: 'message-2', reactions: {} },
    ];

    const {
      storeState: { normalized },
    } = await expectSaga(updateMessageEmojiReaction, roomId, reaction)
      .withReducer(rootReducer)
      .withState(initialState)
      .run();

    expect(normalized.messages['message-1']).toEqual(updatedMessages[0]);
  });

  it('does not update reactions if the message does not exist', async () => {
    const roomId = 'room-id';
    const reaction = { eventId: 'message-3', key: '❤️' };
    const messages = [
      { id: 'message-1', reactions: { '👍': 1 } },
      { id: 'message-2', reactions: {} },
    ];

    const initialState = {
      normalized: {
        messages: {
          'message-1': messages[0],
          'message-2': messages[1],
        },
        channels: {
          [roomId]: {
            id: roomId,
            messages: ['message-1', 'message-2'],
          },
        },
      },
    };

    const {
      storeState: { normalized },
    } = await expectSaga(updateMessageEmojiReaction, roomId, reaction)
      .withReducer(rootReducer)
      .withState(initialState)
      .run();

    expect(normalized.messages).toEqual({
      'message-1': messages[0],
      'message-2': messages[1],
    });
  });
});

describe('sendEmojiReaction', () => {
  it('calls sendEmojiReactionEvent with the correct arguments', async () => {
    const roomId = 'room-id';
    const messageId = 'message-1';
    const key = '❤️';

    await expectSaga(sendEmojiReaction, { payload: { roomId, messageId, key } })
      .provide([
        [matchers.call.fn(sendEmojiReactionEvent), undefined],
      ])
      .call(sendEmojiReactionEvent, roomId, messageId, key)
      .run();
  });
});
