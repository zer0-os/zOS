import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  receiveDelete,
  editMessage,
  getPreview,
  clearMessages,
  sendBrowserNotification,
  receiveUpdateMessage,
  replaceOptimisticMessage,
} from './saga';

import { rootReducer } from '../reducer';
import { mapMessage, send as sendBrowserMessage } from '../../lib/browser';
import { call } from 'redux-saga/effects';
import { StoreBuilder } from '../test/store';
import { MessageSendStatus } from '.';
import { chat } from '../../lib/chat';
import { NotifiableEventType } from '../../lib/chat/matrix/types';

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

    await expectSaga(sendBrowserNotification, eventData as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .call(sendBrowserMessage, mapMessage(eventData as any))
      .run();
  });

  it('does not send a browser notification for a conversation when event type is not a message event', async () => {
    const eventData = {
      id: 8667728016,
      sender: { userId: 'sender-id' },
      createdAt: 1678861267433,
      type: '',
    };

    await expectSaga(sendBrowserNotification, eventData as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .not.call(sendBrowserMessage, mapMessage(eventData as any))
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
      normalized: {
        channels: {
          'room-id-1': { isMuted: false },
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
      normalized: {
        channels: {
          'room-id-1': { isMuted: true },
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

  describe('getPreview', () => {
    it('guards from empty messages (like when you upload a file)', () => {
      const generator = getPreview(null);

      expect(generator.next().value).toEqual(undefined);
    });
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
      .provide([...successResponses()])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.normalized.messages).toEqual({ 8667728016: editedMessage });
  });

  it('adds the preview if exists', async () => {
    const message = { id: 8667728016, message: 'original message' };
    const editedMessage = { id: 8667728016, message: 'edited message: www.example.com' };
    const preview = { id: 'fdf2ce2b-062e-4a83-9c27-03f36c81c0c0', type: 'link' };

    const initialState = new StoreBuilder().withConversationList({ id: 'channel-1', messages: [message] as any });

    const { storeState } = await expectSaga(receiveUpdateMessage, {
      payload: { channelId: 'channel-1', message: editedMessage },
    })
      .provide([
        [call(getPreview, editedMessage.message), preview],
        ...successResponses(),
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.normalized.messages[message.id]).toEqual({ ...editedMessage, preview });
  });

  function successResponses() {
    return [
      [
        matchers.call.fn(getPreview),
        null,
      ],
    ] as any;
  }
});

describe(replaceOptimisticMessage, () => {
  it('returns null if there is no optimisticId on the new message', async () => {
    const newMessage = { id: 'new-message' };
    const { returnValue } = await expectSaga(replaceOptimisticMessage, [], newMessage).run();

    expect(returnValue).toEqual(null);
  });

  it('returns null if there is no message identified by the optimisticId', async () => {
    const currentMessages = ['message-1', 'message-2'];
    const newMessage = { id: 'new-message', optimisticId: 'optimistic-id' };

    const { returnValue } = await expectSaga(replaceOptimisticMessage, currentMessages, newMessage).run();

    expect(returnValue).toEqual(null);
  });

  it('returns message list with replaced message and success status', async () => {
    const currentMessages = ['message-1', 'optimistic-id', 'message-2'];
    const oldMessages = [
      { id: 'message-1' },
      { id: 'optimistic-id', optimisticId: 'optimistic-id' },
      { id: 'message-2' },
    ] as any;
    const newMessage = { id: 'new-message', optimisticId: 'optimistic-id' };
    const initialState = new StoreBuilder().withConversationList({ id: 'channel-id', messages: oldMessages });

    const { returnValue } = await expectSaga(replaceOptimisticMessage, currentMessages, newMessage)
      .withReducer(rootReducer, initialState.build())
      .run();

    const expectedNewMessage = { ...newMessage, sendStatus: MessageSendStatus.SUCCESS };
    expect(returnValue).toEqual(['message-1', expectedNewMessage, 'message-2']);
  });

  it('replaces the preview with the new one if exists', async () => {
    const currentMessages = ['optimistic-id'];
    const oldMessages = [{ id: 'optimistic-id', preview: { url: 'example.com/old-preview' } }] as any;
    const newMessage = {
      id: 'new-message',
      optimisticId: 'optimistic-id',
      preview: { url: 'example.com/new-preview' },
    };
    const initialState = new StoreBuilder().withConversationList({ id: 'channel-id', messages: oldMessages });

    const { returnValue } = await expectSaga(replaceOptimisticMessage, currentMessages, newMessage)
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(returnValue[0].preview).toEqual({ url: 'example.com/new-preview' });
  });

  it('maintains the optimistic preview if no new one received', async () => {
    const currentMessages = ['optimistic-id'];
    const oldMessages = [{ id: 'optimistic-id', preview: { url: 'example.com/old-preview' } }] as any;
    const newMessage = { id: 'new-message', optimisticId: 'optimistic-id' };
    const initialState = new StoreBuilder().withConversationList({ id: 'channel-id', messages: oldMessages });

    const { returnValue } = await expectSaga(replaceOptimisticMessage, currentMessages, newMessage)
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(returnValue[0].preview).toEqual({ url: 'example.com/old-preview' });
  });
});
