import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchMessagesByChannelId, sendMessagesByChannelId } from './api';
import { fetch, send } from './saga';

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
    const mentionedUser = '00000000000000A';

    await expectSaga(send, { payload: { channelId, message, mentionedUser } })
      .provide([
        [
          matchers.call.fn(sendMessagesByChannelId),
          { body: 'ok' },
        ],
        [
          matchers.call.fn(fetchMessagesByChannelId),
          MESSAGES_RESPONSE,
        ],
      ])
      .withReducer(rootReducer)
      .call(sendMessagesByChannelId, channelId, message, mentionedUser)
      .call(fetchMessagesByChannelId, channelIdPrefix + channelId)
      .run();
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
