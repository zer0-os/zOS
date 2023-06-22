import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchMessagesByChannelId } from './api';
import { fetch } from './saga';
import { rootReducer } from '../reducer';

describe(fetch, () => {
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
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), MESSAGES_RESPONSE)])
      .withReducer(rootReducer)
      .call(fetchMessagesByChannelId, channelId)
      .run();
  });

  it('fetches messages for referenceTimestamp', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const referenceTimestamp = 1658776625730;

    await expectSaga(fetch, { payload: { channelId, referenceTimestamp } })
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), MESSAGES_RESPONSE)])
      .withReducer(rootReducer)
      .call(fetchMessagesByChannelId, channelId, 1658776625730)
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
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), messageResponse)])
      .run();

    expect(channels[channelId].hasMore).toBe(false);
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
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), NEW_MESSAGES_RESPONSE)])
      .run();

    expect(channels[channelId].shouldSyncChannels).toBe(true);
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
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), messageResponse)])
      .run();

    expect(channels[channelId].messages).toStrictEqual([
      'the-first-message-id',
      'the-second-message-id',
      'the-third-message-id',
    ]);
  });

  it('prepends message ids to channels state when referenceTimestamp included', async () => {
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
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), messageResponse)])
      .run();

    expect(channels[channelId].messages).toEqual([
      'the-second-message-id',
      'the-third-message-id',
      'the-first-message-id',
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
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), response)])
      .withReducer(rootReducer)
      .run();

    expect(messages).toMatchObject({
      'the-first-message-id': { id: 'the-first-message-id', message: 'the first message' },
      'the-second-message-id': { id: 'the-second-message-id', message: 'the second message' },
      'the-third-message-id': { id: 'the-third-message-id', message: 'the third message' },
    });
  });
});

// Duplicated in other tests. Not quite sure where to put a test library file
function stubResponse(matcher, response) {
  return [
    matcher,
    response,
  ] as any;
}
