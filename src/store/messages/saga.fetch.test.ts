import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchMessagesByChannelId } from './api';
import { fetch } from './saga';
import { rootReducer } from '../reducer';
import { denormalize } from '../channels';

describe(fetch, () => {
  it('fetches messages', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetch, { payload: { channelId } })
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), {})])
      .withReducer(rootReducer)
      .call(fetchMessagesByChannelId, channelId)
      .run();
  });

  it('fetches messages for referenceTimestamp', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const referenceTimestamp = 1658776625730;

    await expectSaga(fetch, { payload: { channelId, referenceTimestamp } })
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), { messages: [] })])
      .withReducer(rootReducer)
      .call(fetchMessagesByChannelId, channelId, 1658776625730)
      .run();
  });

  it('sets hasMore on channel', async () => {
    const channel = { id: 'channel-id', hasMore: true };
    const messageResponse = { hasMore: false };

    const { storeState } = await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), messageResponse)])
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasMore).toBe(false);
  });

  it('forces shouldSyncChannels to be true', async () => {
    const channel = { id: 'channel-id', shouldSyncChannels: false };
    const messageResponse = { shouldSyncChannels: false };

    const { storeState } = await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), messageResponse)])
      .withReducer(rootReducer, initialChannelState(channel) as any)
      .run();

    expect(denormalize(channel.id, storeState).shouldSyncChannels).toBe(true);
  });

  it('adds messages to channel', async () => {
    const channel = { id: 'channel-id', messages: ['old-message-id'] };
    const messageResponse = {
      messages: [
        { id: 'the-first-message-id', message: 'the first message' },
        { id: 'the-second-message-id', message: 'the second message' },
        { id: 'the-third-message-id', message: 'the third message' },
      ],
    };

    const { storeState } = await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([stubResponse(matchers.call.fn(fetchMessagesByChannelId), messageResponse)])
      .withReducer(rootReducer, initialChannelState(channel) as any)
      .run();

    expect(denormalize(channel.id, storeState).messages).toStrictEqual([
      { id: 'the-first-message-id', message: 'the first message' },
      { id: 'the-second-message-id', message: 'the second message' },
      { id: 'the-third-message-id', message: 'the third message' },
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

    const channel = {
      id: channelId,
      messages: [
        'the-first-message-id',
      ],
    };
    const initialState = {
      normalized: {
        channels: {
          [channelId]: channel,
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

  function initialChannelState(channel) {
    return {
      normalized: {
        channels: {
          [channel.id]: channel,
        },
      },
    } as any;
  }
});

// Duplicated in other tests. Not quite sure where to put a test library file
function stubResponse(matcher, response) {
  return [
    matcher,
    response,
  ] as any;
}
