import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchMessagesByChannelId } from './api';
import { fetch } from './saga';

import { rootReducer } from '..';

describe('messages saga', () => {
  it('fetches messages', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetch, { payload: channelId })
      .provide([
        [
          matchers.call.fn(fetchMessagesByChannelId),
          [],
        ],
      ])
      .call(fetchMessagesByChannelId, channelId)
      .run();
  });

  it('adds message ids to channels state', async () => {
    const channelId = 'channel-id';
    const messages = [
      { id: 'the-first-message-id', message: 'the first message' },
      { id: 'the-second-message-id', message: 'the second message' },
      { id: 'the-third-message-id', message: 'the third message' },
    ];

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(fetch, { payload: channelId })
      .withReducer(rootReducer)
      .provide([
        [
          matchers.call.fn(fetchMessagesByChannelId),
          messages,
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
    const id = 'message-id';
    const name = 'the message';

    const {
      storeState: { normalized },
    } = await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .provide([
        [
          matchers.call.fn(fetchMessagesByChannelId),
          [{ id, name }],
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(normalized.messages[id]).toStrictEqual({ id, name });
  });
});
