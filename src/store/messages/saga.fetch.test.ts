import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetch } from './saga';
import { rootReducer } from '../reducer';
import { ConversationStatus, denormalize } from '../channels';
import { ChannelEvents, conversationsChannel } from '../channels-list/channels';
import { multicastChannel } from 'redux-saga';
import { chat } from '../../lib/chat';
import { StoreBuilder } from '../test/store';
import { call } from 'redux-saga/effects';

const chatClient = {
  getMessagesByChannelId: (_channelId: string, _referenceTimestamp?: number) => ({}),
};

describe(fetch, () => {
  it('fetches messages', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetch, { payload: { channelId } })
      .provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getMessagesByChannelId), {}],
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

  it('sets hasMore on channel', async () => {
    const channel = { id: 'channel-id', hasMore: true };
    const messageResponse = { hasMore: false };

    const { storeState } = await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getMessagesByChannelId), messageResponse],
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
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getMessagesByChannelId), { messages: [] }],
        [matchers.call.fn(conversationsChannel), conversationsChannelStub],
      ])
      .withReducer(rootReducer, initialChannelState({ ...channel, isChannel: true }))
      .put(conversationsChannelStub, { type: ChannelEvents.MessagesLoadedForChannel, channelId: channel.id })
      .run();

    // conversation
    await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getMessagesByChannelId), { messages: [] }],
        [matchers.call.fn(conversationsChannel), conversationsChannelStub],
      ])
      .withReducer(rootReducer, initialChannelState({ ...channel, isChannel: false }))
      .put(conversationsChannelStub, { type: ChannelEvents.MessagesLoadedForConversation, channelId: channel.id })
      .run();
  });

  it('sets hasLoadedMessages on channel', async () => {
    const channel = { id: 'channel-id', hasLoadedMessages: false };

    const { storeState } = await expectSaga(fetch, { payload: { channelId: channel.id } })
      .provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getMessagesByChannelId), {}],
      ])
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasLoadedMessages).toBe(true);
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
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getMessagesByChannelId), messageResponse],
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

    const channel = {
      id: 'channel-id',
      messages: [
        { id: 'the-first-message-id' },
      ],
    };
    const initialState = initialChannelState(channel);

    const referenceTimestamp = 1658776625730;
    const { storeState } = await expectSaga(fetch, {
      payload: { channelId: channel.id, referenceTimestamp },
    })
      .withReducer(rootReducer, initialState as any)
      .provide([
        [matchers.call.fn(chat.get), chatClient],
        [call([chatClient, chatClient.getMessagesByChannelId], channel.id, referenceTimestamp), messageResponse],
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
      .provide([
        [matchers.call.fn(chat.get), chatClient],
        [matchers.call.fn(chatClient.getMessagesByChannelId), {}],
      ])
      .not.call.fn(chatClient.getMessagesByChannelId)
      .run();
  });

  function initialChannelState(channel) {
    channel.conversationStatus = channel.conversationStatus ?? ConversationStatus.CREATED;
    return new StoreBuilder().withChannelList(channel).build();
  }
});
