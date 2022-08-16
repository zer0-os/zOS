import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchMessagesByChannelId } from './api';
import { fetch } from './saga';

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

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(fetch, { payload: { channelId } })
      .withReducer(rootReducer)
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
