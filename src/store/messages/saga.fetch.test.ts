import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetch } from './saga';
import { rootReducer } from '../reducer';
import { ConversationStatus, denormalize } from '../channels';
import { ChannelEvents, conversationsChannel } from '../channels-list/channels';
import { multicastChannel } from 'redux-saga';
import { chat } from '../../lib/chat';

const chatClient = {
  getMessagesByChannelId: () => ({}),
};

describe(fetch, () => {
  it('fetches messages', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetch, { payload: { channelId } })
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.getMessagesByChannelId), {}),
      ])
      .withReducer(rootReducer, initialChannelState({ id: channelId }))
      .call(
        [
          chatClient,
          chatClient.getMessagesByChannelId,
        ],
        channelId
      )
      .run();
  });

  it('fetches messages for referenceTimestamp', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const referenceTimestamp = 1658776625730;

    await expectSaga(fetch, { payload: { channelId, referenceTimestamp } })
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.getMessagesByChannelId), { messages: [] }),
      ])
      .withReducer(rootReducer, initialChannelState({ id: channelId }))
      .call(
        [
          chatClient,
          chatClient.getMessagesByChannelId,
        ],
        channelId,
        1658776625730
      )
      .run();
  });

  it('sets hasMore on channel', async () => {
    const channel = { id: 'channel-id', hasMore: true };
    const messageResponse = { hasMore: false };

    const { storeState } = await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.getMessagesByChannelId), messageResponse),
      ])
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasMore).toBe(false);
  });

  it('emits markAsRead event on the conversations channel for a channel OR conversation', async () => {
    const channel = { id: 'channel-id' };
    const conversationsChannelStub = multicastChannel();

    // channel
    await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.getMessagesByChannelId), { messages: [] }),
        stubResponse(matchers.call.fn(conversationsChannel), conversationsChannelStub),
      ])
      .withReducer(rootReducer, initialChannelState({ ...channel, isChannel: true }))
      .put(conversationsChannelStub, { type: ChannelEvents.MessagesLoadedForChannel, channelId: channel.id })
      .run();

    // conversation
    await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.getMessagesByChannelId), { messages: [] }),
        stubResponse(matchers.call.fn(conversationsChannel), conversationsChannelStub),
      ])
      .withReducer(rootReducer, initialChannelState({ ...channel, isChannel: false }))
      .put(conversationsChannelStub, { type: ChannelEvents.MessagesLoadedForConversation, channelId: channel.id })
      .run();
  });

  it('sets hasLoadedMessages on channel', async () => {
    const channel = { id: 'channel-id', hasLoadedMessages: false };

    const { storeState } = await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.getMessagesByChannelId), {}),
      ])
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasLoadedMessages).toBe(true);
  });

  it('forces shouldSyncChannels to be true', async () => {
    const channel = { id: 'channel-id', shouldSyncChannels: false };
    const messageResponse = { shouldSyncChannels: false };

    const { storeState } = await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.getMessagesByChannelId), messageResponse),
      ])
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
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.getMessagesByChannelId), messageResponse),
      ])
      .withReducer(rootReducer, initialChannelState(channel) as any)
      .run();

    expect(denormalize(channel.id, storeState).messages).toStrictEqual([
      { id: 'the-first-message-id', message: 'the first message' },
      { id: 'the-second-message-id', message: 'the second message' },
      { id: 'the-third-message-id', message: 'the third message' },
    ]);
  });

  it('prepends message ids to channels state when referenceTimestamp included', async () => {
    const messageResponse = {
      messages: [
        { id: 'the-second-message-id', message: 'the second message' },
        { id: 'the-third-message-id', message: 'the third message' },
      ],
    };

    const channel = { id: 'channel-id', messages: [{ id: 'the-first-message-id' }] };
    const initialState = initialChannelState(channel);

    const { storeState } = await expectSaga(fetch, {
      payload: { channelId: channel.id, referenceTimestamp: 1658776625730 },
    })
      .withReducer(rootReducer, initialState as any)
      .provide([
        stubResponse(matchers.call.fn(chat.get), chatClient),
        stubResponse(matchers.call.fn(chatClient.getMessagesByChannelId), messageResponse),
      ])
      .run();

    expect(denormalize(channel.id, storeState).messages.map((m) => m.id)).toEqual([
      'the-second-message-id',
      'the-third-message-id',
      'the-first-message-id',
    ]);
  });

  it('does not fetch messages if channel is not yet created', async () => {
    const channelId = 'channel-id';

    const initialState = initialChannelState({ id: channelId, conversationStatus: ConversationStatus.CREATING });

    await expectSaga(fetch, { payload: { channelId } })
      .withReducer(rootReducer, initialState)
      .not.call(fetchMessagesByChannelId, channelId)
      .run();
  });

  function initialChannelState(channel) {
    const messages = {};
    (channel.messages || []).forEach((m) => (messages[m.id] = m));

    return {
      normalized: {
        channels: {
          [channel.id]: {
            conversationStatus: ConversationStatus.CREATED,
            ...channel,
          },
        },
        messages,
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
