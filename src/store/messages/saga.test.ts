import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchMessagesByChannelId, sendMessagesByChannelId } from './api';
import { fetch, send, fetchNewMessages, stopSyncChannels } from './saga';

import { rootReducer } from '..';
import { channelIdPrefix } from '../channels-list/saga';

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
      .call(fetchMessagesByChannelId, channelIdPrefix + channelId)
      .run();
  });

  it('send message', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const message = 'hello';

    const initialState = {
      // normalized: {
      //   channels: {
      //     [channelId]: {
      //       id: channelId,
      //       messages,
      //     },
      //   },
      // },
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

    await expectSaga(send, { payload: { channelId, message } })
      .provide([
        [
          matchers.call.fn(sendMessagesByChannelId),
          { status: 200, body: { id: 'message 1', message } },
        ],
      ])
      .withReducer(rootReducer, initialState as any)
      .call(sendMessagesByChannelId, channelId, message)
      .run();
  });

  it.only('send message return a 400 status', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const message = 'hello';
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
    } = await expectSaga(send, { payload: { channelId, message } })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [
          matchers.call.fn(sendMessagesByChannelId),
          { status: 400, body: {} },
        ],
      ])
      .call(sendMessagesByChannelId, channelId, message)
      .run();

    expect(channels[channelId].messages).toStrictEqual(messages.map((messageItem) => messageItem.id));
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
      .call(fetchMessagesByChannelId, channelIdPrefix + channelId, 1658776625730)
      .run();
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
