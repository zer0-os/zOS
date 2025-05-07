import * as matchers from 'redux-saga-test-plan/matchers';

import { fetchMessages, mapMessagesAndPreview } from './saga';
import { rootReducer } from '../reducer';
import { ConversationStatus, denormalize } from '../channels';
import { chat } from '../../lib/chat';
import { StoreBuilder } from '../test/store';
import { expectSaga } from '../../test/saga';

const chatClient = {
  getMessagesByChannelId: (_channelId: string, _referenceTimestamp?: number) => ({}),
  syncChannelMessages: (_channelId: string) => ({}),
  getLastChannelMessage: (_channelId: string) => ({}),
};

describe(fetchMessages, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [matchers.call.fn(chat.get), chatClient],
      [matchers.call.fn(chatClient.getMessagesByChannelId), { messages: [] }],
      [matchers.call.fn(chatClient.syncChannelMessages), []],
    ]);
  }

  it('sets hasMore on channel', async () => {
    const channel = { id: 'channel-id', hasMore: true, messages: [] };
    const messageResponse = { hasMore: false, messages: [] };
    const syncResponse = [];

    const { storeState } = await subject(fetchMessages, { payload: { channelId: channel.id } })
      .provide([
        [matchers.call.fn(chatClient.getMessagesByChannelId), messageResponse],
        [matchers.call.fn(chatClient.syncChannelMessages), syncResponse],
        [matchers.call.fn(mapMessagesAndPreview), syncResponse],
      ])
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasMore).toBe(false);
  });

  it('sets hasLoadedMessages on channel', async () => {
    const channel = { id: 'channel-id', hasLoadedMessages: false };
    const syncResponse = [];

    const { storeState } = await subject(fetchMessages, { payload: { channelId: channel.id } })
      .provide([
        [matchers.call.fn(chatClient.syncChannelMessages), syncResponse],
        [matchers.call.fn(mapMessagesAndPreview), syncResponse],
      ])
      .withReducer(rootReducer, initialChannelState(channel))
      .run();

    expect(denormalize(channel.id, storeState).hasLoadedMessages).toBe(true);
  });

  it('does not fetch messages if channel is not yet created', async () => {
    const channelId = 'channel-id';

    const initialState = initialChannelState({ id: channelId, conversationStatus: ConversationStatus.CREATING });

    await subject(fetchMessages, { payload: { channelId } })
      .withReducer(rootReducer, initialState)
      .not.call.fn(chatClient.getMessagesByChannelId)
      .run();
  });

  function initialChannelState(channel) {
    channel.conversationStatus = channel.conversationStatus ?? ConversationStatus.CREATED;
    return new StoreBuilder().withConversationList(channel).build();
  }
});
