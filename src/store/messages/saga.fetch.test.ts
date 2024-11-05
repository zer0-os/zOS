import * as matchers from 'redux-saga-test-plan/matchers';

import { fetch, mapMessagesAndPreview } from './saga';
import { rootReducer } from '../reducer';
import { ConversationStatus, denormalize } from '../channels';
import { chat } from '../../lib/chat';
import { StoreBuilder } from '../test/store';
import { call } from 'redux-saga/effects';
import { expectSaga } from '../../test/saga';

const chatClient = {
  getMessagesByChannelId: (_channelId: string, _referenceTimestamp?: number) => ({}),
};

describe(fetch, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [matchers.call.fn(chat.get), chatClient],
      [matchers.call.fn(chatClient.getMessagesByChannelId), { messages: [] }],
    ]);
  }

  it('adds newly fetched messages to channel', async () => {
    const existingMessages = [
      { id: 'second-page', message: 'old' },
      { id: 'first-page', message: 'fresh' },
    ];
    const channel = { id: 'channel-id', messages: existingMessages };
    const messageResponse = {
      messages: [
        { id: 'first-page', message: 'fresh' },
        { id: 'brand-new', message: 'new' },
      ],
    };

    const { storeState } = await subject(fetch, { payload: { channelId: channel.id } })
      .provide([
        [call([chatClient, chatClient.getMessagesByChannelId], channel.id), messageResponse],
        [matchers.call.fn(mapMessagesAndPreview), messageResponse.messages],
      ])
      .withReducer(rootReducer, initialChannelState(channel) as any)
      .run();

    expect(denormalize(channel.id, storeState).messages).toIncludeSameMembers([
      { id: 'second-page', message: 'old' },
      { id: 'first-page', message: 'fresh' },
      { id: 'brand-new', message: 'new' },
    ]);
  });

  it('sets hasMore on channel', async () => {
    const channel = { id: 'channel-id', hasMore: true, messages: [] };
    const messageResponse = { hasMore: false, messages: [] };

    const { storeState } = await subject(fetch, { payload: { channelId: channel.id } })
      .provide([[matchers.call.fn(chatClient.getMessagesByChannelId), messageResponse]])
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasMore).toBe(false);
  });

  it('sets hasLoadedMessages on channel', async () => {
    const channel = { id: 'channel-id', hasLoadedMessages: false };

    const { storeState } = await subject(fetch, { payload: { channelId: channel.id } })
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasLoadedMessages).toBe(true);
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

    const referenceTimestamp = 1658776625730;
    const { storeState } = await subject(fetch, { payload: { channelId: channel.id, referenceTimestamp } })
      .withReducer(rootReducer, initialState as any)
      .provide([
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

    await subject(fetch, { payload: { channelId } })
      .withReducer(rootReducer, initialState)
      .not.call.fn(chatClient.getMessagesByChannelId)
      .run();
  });

  function initialChannelState(channel) {
    channel.conversationStatus = channel.conversationStatus ?? ConversationStatus.CREATED;
    return new StoreBuilder().withConversationList(channel).build();
  }
});
