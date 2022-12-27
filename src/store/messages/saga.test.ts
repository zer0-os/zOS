import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchMessagesByChannelId, sendMessagesByChannelId, deleteMessageApi, editMessageApi } from './api';
import { fetch, send, fetchNewMessages, stopSyncChannels, deleteMessage, editMessage, receiveDelete } from './saga';

import { rootReducer } from '..';

describe('messages saga', () => {
  const MESSAGES_RESPONSE = {
    hasMore: true,
    messages: [
      { id: 'message 1', message: 'message_0001' },
      { id: 'message 2', message: 'message_0002' },
      { id: 'message 3', message: 'message_0003' },
    ],
  };

  it('fetches messages', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetch, { payload: { channelId } })
      .provide([
        [
          matchers.call.fn(fetchMessagesByChannelId),
          MESSAGES_RESPONSE,
        ],
      ])
      .withReducer(rootReducer)
      .call(fetchMessagesByChannelId, channelId)
      .run();
  });

  it('send message', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const message = 'hello';
    const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];

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

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(send, { payload: { channelId, message, mentionedUserIds } })
      .provide([
        [
          matchers.call.fn(sendMessagesByChannelId),
          { status: 200, body: { id: 'message 1', message } },
        ],
      ])
      .withReducer(rootReducer, initialState as any)
      .call(sendMessagesByChannelId, channelId, message, mentionedUserIds)
      .run();
    expect(channels[channelId].messageIdsCache).not.toStrictEqual([]);
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
      .call(editMessageApi, channelId, messageIdToEdit, message, mentionedUserIds)
      .run();
  });

  it('send message return a 400 status', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const message = 'hello';
    const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];
    const messages = [
      { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
      { id: 'message 2', message: 'message_0002', createdAt: 10000000008 },
      { id: 'message 3', message: 'message_0003', createdAt: 10000000009 },
    ];

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            messages,
          },
        },
      },
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

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(send, { payload: { channelId, message, mentionedUserIds } })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [
          matchers.call.fn(sendMessagesByChannelId),
          { status: 400, body: {} },
        ],
      ])
      .call(sendMessagesByChannelId, channelId, message, mentionedUserIds)
      .run();

    expect(channels[channelId].messages).toStrictEqual(messages.map((messageItem) => messageItem.id));
    expect(channels[channelId].messageIdsCache.length).toEqual(1);
  });

  it('fetches messages for referenceTimestamp', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const referenceTimestamp = 1658776625730;

    await expectSaga(fetch, { payload: { channelId, referenceTimestamp } })
      .provide([
        [
          matchers.call.fn(fetchMessagesByChannelId),
          MESSAGES_RESPONSE,
        ],
      ])
      .withReducer(rootReducer)
      .call(fetchMessagesByChannelId, channelId, 1658776625730)
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

  it('sets hasMore on channel', async () => {
    const channelId = 'channel-id';
    const messageResponse = {
      hasMore: false,
      messages: [
        { id: 'the-first-message-id', message: 'the first message' },
        { id: 'the-second-message-id', message: 'the second message' },
        { id: 'the-third-message-id', message: 'the third message' },
      ],
    };

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            hasMore: true,
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
          matchers.call.fn(fetchMessagesByChannelId),
          messageResponse,
        ],
      ])
      .run();

    expect(channels[channelId].hasMore).toBe(false);
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

  it('sets shouldSyncChannels on channel', async () => {
    const channelId = 'channel-id';
    const NEW_MESSAGES_RESPONSE = {
      hasMore: true,
      messages: [
        { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
        { id: 'message 2', message: 'message_0002', createdAt: 10000000008 },
        { id: 'message 3', message: 'message_0003', createdAt: 10000000009 },
      ],
      shouldSyncChannels: true,
    };

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            hasMore: true,
            shouldSyncChannels: false,
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
          matchers.call.fn(fetchMessagesByChannelId),
          NEW_MESSAGES_RESPONSE,
        ],
      ])
      .run();

    expect(channels[channelId].shouldSyncChannels).toBe(true);
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

  it('adds message ids to channels state', async () => {
    const channelId = 'channel-id';
    const messageResponse = {
      hasMore: true,
      messages: [
        { id: 'the-first-message-id', message: 'the first message' },
        { id: 'the-second-message-id', message: 'the second message' },
        { id: 'the-third-message-id', message: 'the third message' },
      ],
    };

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            messages: [
              'old-message-id',
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
          matchers.call.fn(fetchMessagesByChannelId),
          messageResponse,
        ],
      ])
      .run();

    expect(channels[channelId].messages).toStrictEqual([
      'the-first-message-id',
      'the-second-message-id',
      'the-third-message-id',
    ]);
  });

  it('appends message ids to channels state when referenceTimestamp included', async () => {
    const channelId = 'channel-id';
    const messageResponse = {
      hasMore: true,
      messages: [
        { id: 'the-second-message-id', message: 'the second message' },
        { id: 'the-third-message-id', message: 'the third message' },
      ],
    };

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            messages: [
              'the-first-message-id',
            ],
          },
        },
      },
    };

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(fetch, { payload: { channelId, referenceTimestamp: 1658776625730 } })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [
          matchers.call.fn(fetchMessagesByChannelId),
          messageResponse,
        ],
      ])
      .run();

    expect(channels[channelId].messages).toIncludeSameMembers([
      'the-first-message-id',
      'the-second-message-id',
      'the-third-message-id',
    ]);
  });

  it('adds messages to normalized state', async () => {
    const response = {
      hasMore: true,
      messages: [
        { id: 'the-first-message-id', message: 'the first message' },
        { id: 'the-second-message-id', message: 'the second message' },
        { id: 'the-third-message-id', message: 'the third message' },
      ],
    };

    const {
      storeState: {
        normalized: { messages },
      },
    } = await expectSaga(fetch, { payload: { channelId: '0x000000000000000000000000000000000000000A' } })
      .provide([
        [
          matchers.call.fn(fetchMessagesByChannelId),
          response,
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(messages).toMatchObject({
      'the-first-message-id': { id: 'the-first-message-id', message: 'the first message' },
      'the-second-message-id': { id: 'the-second-message-id', message: 'the second message' },
      'the-third-message-id': { id: 'the-third-message-id', message: 'the third message' },
    });
  });
});
