import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  fetchMessagesByChannelId,
  sendMessagesByChannelId,
  deleteMessageApi,
  editMessageApi,
  uploadFileMessage as uploadFileMessageApi,
} from './api';
import {
  fetchNewMessages,
  stopSyncChannels,
  deleteMessage,
  receiveDelete,
  editMessage,
  uploadFileMessage,
  getPreview,
  clearMessages,
  sendBrowserNotification,
  receiveUpdateMessage,
} from './saga';

import { RootState, rootReducer } from '../reducer';
import { mapMessage, send as sendBrowserMessage } from '../../lib/browser';
import { call } from 'redux-saga/effects';

describe('messages saga', () => {
  it('sends a browser notification for a conversation', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';

    const message = {
      id: 8667728016,
      message: 'Hello',
      parentMessageText: null,
      createdAt: 1678861267433,
      updatedAt: 0,
    };

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            isChannel: false,
          },
        },
      },
    };

    await expectSaga(sendBrowserNotification, channelId, message as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .call(sendBrowserMessage, mapMessage(message as any))
      .withState(initialState)
      .run();
  });

  it('does not send a browser notification when the user is the sender', async () => {
    const user = {
      id: 'the-user-id',
    };
    const channelId = '0x000000000000000000000000000000000000000A';

    const message = {
      id: 8667728016,
      message: 'I should not receive this message, because I sent it',
      parentMessageText: null,
      createdAt: 1678861267433,
      updatedAt: 0,
      sender: { userId: user.id },
    };

    const initialState = {
      authentication: { user: { data: user } },
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            isChannel: false,
          },
        },
      },
    };

    await expectSaga(sendBrowserNotification, channelId, message as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .not.call(sendBrowserMessage, mapMessage(message as any))
      .withState(initialState)
      .run();
  });

  it('does not send a browser notification for a channel', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';

    const message = {
      id: 8667728016,
      message: 'Hello',
      parentMessageText: null,
      createdAt: 1678861267433,
      updatedAt: 0,
    };

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            isChannel: true,
          },
        },
      },
    };

    await expectSaga(sendBrowserNotification, channelId, message as any)
      .provide([
        [
          matchers.call.fn(sendBrowserMessage),
          undefined,
        ],
      ])
      .not.call(sendBrowserMessage, mapMessage(message as any))
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
        [
          matchers.call.fn(editMessageApi),
          { status: 200 },
        ],
      ])
      .withReducer(rootReducer)
      .call(editMessageApi, channelId, messageIdToEdit, message, mentionedUserIds, undefined)
      .run();
  });

  it('upload file message', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const media = [
      {
        id: 'id image 1',
        url: 'url media',
        name: 'image 1',
        nativeFile: { path: 'Screen Shot 2022-12-07 at 18.39.01.png', type: 'image/png' },
        mediaType: 'image',
      },
    ];

    await expectSaga(uploadFileMessage, { payload: { channelId, media } })
      .provide([
        [
          matchers.call.fn(uploadFileMessageApi),
          {
            id: 'id image 1',
            url: 'url media',
            name: 'image 1',
            type: 'image',
          },
        ],
      ])
      .withReducer(rootReducer)
      .call(uploadFileMessageApi, channelId, media[0].nativeFile)
      .run();
  });

  it('send Giphy message', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const media = [
      {
        id: 'id image 1',
        name: 'image 1',
        giphy: { images: { original: { url: 'url_giphy' } }, type: 'gif' },
        mediaType: 'image',
      },
    ];

    const initialState = {
      authentication: {
        user: {
          data: {
            id: 1,
            profileId: '2',
            profileSummary: {
              firstName: 'Johnn',
              lastName: 'Doe',
              profileImage: '/image.jpg',
            },
          },
        },
      },
    };

    await expectSaga(uploadFileMessage, { payload: { channelId, media } })
      .provide([
        [
          matchers.call.fn(sendMessagesByChannelId),
          {
            status: 200,
            body: {
              id: 'id image 1',
              url: 'url_giphy',
              name: 'image 1',
              type: 'gif',
            },
          },
        ],
      ])
      .withReducer(rootReducer, initialState as any)
      .call(sendMessagesByChannelId, channelId, undefined, undefined, undefined, {
        url: media[0].giphy.images.original.url,
        name: media[0].name,
        type: media[0].giphy.type,
      })
      .run();
  });

  it('delete message', async () => {
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
    } = await expectSaga(deleteMessage, { payload: { channelId, messageId: messageIdToDelete } })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [
          matchers.call.fn(deleteMessageApi),
          200,
        ],
      ])
      .run();

    expect(normalized.channels[channelId].messages).toEqual([
      messages[0].id,
      messages[2].id,
    ]);
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

  it('sets countNewMessages on channel', async () => {
    const channelId = 'channel-id';
    const NEW_MESSAGES_RESPONSE = {
      hasMore: true,
      messages: [
        { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
        { id: 'message 2', message: 'message_0002', createdAt: 10000000008 },
        { id: 'message 3', message: 'message_0003', createdAt: 10000000009 },
      ],
      countNewMessages: 1,
      lastMessageCreatedAt: 10000000009,
    };

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            hasMore: true,
            countNewMessages: 0,
            lastMessageCreatedAt: 10000000008,
          },
        },
      },
    };

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(fetchNewMessages, { payload: { channelId } })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [
          matchers.call.fn(fetchMessagesByChannelId),
          NEW_MESSAGES_RESPONSE,
        ],
      ])
      .run();

    expect(channels[channelId].countNewMessages).toStrictEqual(1);
  });

  it('sets lastMessageCreatedAt on channel', async () => {
    const channelId = 'channel-id';
    const NEW_MESSAGES_RESPONSE = {
      hasMore: true,
      messages: [
        { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
        { id: 'message 2', message: 'message_0002', createdAt: 10000000008 },
        { id: 'message 3', message: 'message_0003', createdAt: 10000000009 },
      ],
      countNewMessages: 1,
      lastMessageCreatedAt: 10000000009,
    };

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            hasMore: true,
            countNewMessages: 0,
            lastMessageCreatedAt: 10000000008,
          },
        },
      },
    };

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(fetchNewMessages, { payload: { channelId } })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [
          matchers.call.fn(fetchMessagesByChannelId),
          NEW_MESSAGES_RESPONSE,
        ],
      ])
      .run();

    expect(channels[channelId].lastMessageCreatedAt).toStrictEqual(10000000009);
  });

  it('stop syncChannels when calling stopSyncChannels', async () => {
    const channelId = 'channel-id';

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            hasMore: true,
            shouldSyncChannels: true,
          },
        },
      },
    };

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(stopSyncChannels, { payload: { channelId } })
      .withReducer(rootReducer, initialState as any)
      .run();

    expect(channels[channelId].shouldSyncChannels).toBe(false);
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
      .run(0);

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

    const messages = { 8667728016: message };

    const { storeState } = await expectSaga(receiveUpdateMessage, {
      payload: { channelId: 'channel-1', message: editedMessage },
    })
      .provide([
        ...successResponses(),
      ])
      .withReducer(rootReducer, { normalized: { messages } as any } as RootState)
      .run();

    expect(storeState.normalized.messages).toEqual({ 8667728016: editedMessage });
  });

  it('adds the preview if exists', async () => {
    const message = { id: 8667728016, message: 'original message' };
    const messages = { 8667728016: message };
    const editedMessage = { id: 8667728016, message: 'edited message: www.example.com' };
    const preview = { id: 'fdf2ce2b-062e-4a83-9c27-03f36c81c0c0', type: 'link' };

    const { storeState } = await expectSaga(receiveUpdateMessage, {
      payload: { channelId: 'channel-1', message: editedMessage },
    })
      .provide([
        [
          call(getPreview, editedMessage.message),
          preview,
        ],
        ...successResponses(),
      ])
      .withReducer(rootReducer, { normalized: { messages } as any } as RootState)
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
