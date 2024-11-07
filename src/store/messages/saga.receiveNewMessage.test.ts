import delayP from '@redux-saga/delay-p';
import * as matchers from 'redux-saga-test-plan/matchers';
import { call } from 'redux-saga/effects';

import { getLinkPreviews } from './api';
import { batchedReceiveNewMessage, getPreview, receiveNewMessage, sendBrowserNotification } from './saga';
import { rootReducer } from '../reducer';

import { denormalize as denormalizeChannel } from '../channels';
import { expectSaga, stubResponse } from '../../test/saga';
import { markConversationAsRead } from '../channels/saga';
import { StoreBuilder } from '../test/store';
import { getMessageEmojiReactions } from '../../lib/chat';

describe(receiveNewMessage, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [matchers.call.fn(getLinkPreviews), null],
      [matchers.spawn.fn(sendBrowserNotification), undefined],
      [matchers.call.fn(markConversationAsRead), undefined],
      // Execute immediately without debouncing
      [matchers.call.fn(delayP), true], // delayP is what delay calls behind the scenes. Not ideal but it works.
    ]);
  }

  it('adds the message to the channel', async () => {
    const channelId = 'channel-id';
    const message = { id: 'new-message', message: 'a new message', optimisticId: 'other-front-end-id' };
    const existingMessages = [{ id: 'message-1', message: 'message_0001' }] as any;
    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages: existingMessages });

    const { storeState } = await subject(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
      ])
      .withReducer(rootReducer, initialState.build())

      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('message-1');
    expect(channel.messages[1].id).toEqual('new-message');
  });

  it('maps the message users', async () => {
    const channelId = 'channel-id';
    const message = { id: 'message-id', message: 'test message', sender: { userId: 'matrix-id' } };
    const initialState = new StoreBuilder()
      .withConversationList({ id: channelId })
      .withUsers({ userId: 'user-1', matrixId: 'matrix-id', firstName: 'the real user' });

    const { storeState } = await subject(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].sender.firstName).toEqual('the real user');
  });

  it('adds the link previews to the message', async () => {
    const channelId = 'channel-id';
    const message = { id: 'message-id', message: 'www.google.com' };
    const stubPreview = { id: 'simulated-preview' };
    const initialState = new StoreBuilder().withConversationList({ id: channelId });

    const { storeState } = await subject(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
        stubResponse(call(getPreview, 'www.google.com'), stubPreview),
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(stubPreview);
  });

  it('adds the reactions to the message', async () => {
    const channelId = 'channel-id';
    const message = { id: 'message-id', message: 'www.google.com' };
    const stubPreview = { id: 'simulated-preview' };
    const stubReactions = [{ eventId: 'message-id', key: '😂' }];
    const initialState = new StoreBuilder().withConversationList({ id: channelId });

    const { storeState } = await subject(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, channelId), stubReactions),
        stubResponse(call(getPreview, 'www.google.com'), stubPreview),
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].reactions).toEqual({ '😂': 1 });
  });

  it('does nothing if the channel does not exist', async () => {
    const channelId = 'non-existing-channel-id';
    const initialState = new StoreBuilder().withConversationList({ id: 'other-channel' });

    await subject(receiveNewMessage, { payload: { channelId, message: {} } })
      .withReducer(rootReducer, initialState.build())
      .not.put.like({ action: { type: 'normalized/receive' } })
      .run();
  });

  it('favors the new version if message already exists', async () => {
    const channelId = 'channel-id';
    const message = { id: 'new-message', message: 'the new message' };
    const existingMessages = [
      { id: 'new-message', message: 'message_0001' },
      { id: 'other-message', message: 'message_0002' },
    ] as any;
    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages: existingMessages });

    const { storeState } = await subject(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages.map((m) => m.id)).toEqual(['other-message', 'new-message']);
    expect(channel.messages[1].message).toEqual('the new message');
  });

  it('does not call markConversationAsRead when new message is received but conversation is NOT active', async () => {
    const message = { id: 'message-id', message: '' };
    const conversationState = new StoreBuilder().withConversationList({ id: 'channel-id' });

    await subject(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, 'channel-id'), [{}]),
      ])
      .withReducer(rootReducer, conversationState.build())
      .not.call(markConversationAsRead, 'channel-id')
      .run();
  });

  it('replaces optimistically rendered message', async () => {
    const channelId = 'channel-id';
    const message = {
      id: 'system-provided-id',
      message: 'test message for asserting. normally would not change.',
      optimisticId: 'optimistic-id',
    };
    const existingMessages = [
      { id: 'optimistic-id', message: 'optimistic', optimisticId: 'optimistic-id' },
      { id: 'standard-id', message: 'message_0001' },
    ] as any;

    const initialState = new StoreBuilder().withConversationList({
      id: channelId,
      messages: existingMessages,
    });

    const { storeState } = await subject(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('system-provided-id');
    expect(channel.messages[0].message).toEqual('test message for asserting. normally would not change.');
    expect(channel.messages[1].id).toEqual('standard-id');
  });

  it('replaces the correct optimistic message if multiple have been sent', async () => {
    const channelId = 'channel-id';
    const message = { id: 'system-provided-id', optimisticId: 'optimistic-id-2' };
    const existingMessages = [
      { id: 'optimistic-id-1', message: 'optimistic1', optimisticId: 'optimistic-id-1' },
      { id: 'optimistic-id-2', message: 'optimistic2', optimisticId: 'optimistic-id-2' },
      { id: 'standard-id', message: 'message_0001' },
    ] as any;

    const initialState = new StoreBuilder().withConversationList({
      id: channelId,
      messages: existingMessages,
    });

    const { storeState } = await subject(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('optimistic-id-1');
    expect(channel.messages[1].id).toEqual('system-provided-id');
  });

  describe(batchedReceiveNewMessage, () => {
    function subject(...args: Parameters<typeof expectSaga>) {
      return expectSaga(...args).provide([
        [matchers.call.fn(getLinkPreviews), null],
        [matchers.spawn.fn(sendBrowserNotification), undefined],
        [matchers.call.fn(markConversationAsRead), undefined],
      ]);
    }

    it('adds all messages to the channel', async () => {
      const channelId = 'channel-id';
      const eventPayloads = [
        { channelId, message: { id: 'new-message', message: 'a new message' } },
        { channelId, message: { id: 'second-new-message', message: 'another' } },
      ];

      const existingMessages = [{ id: 'message-1', message: 'message_0001' }] as any;
      const initialState = new StoreBuilder().withConversationList({ id: channelId, messages: existingMessages });

      const { storeState } = await subject(batchedReceiveNewMessage, eventPayloads)
        .provide([
          stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      const channel = denormalizeChannel(channelId, storeState);
      expect(channel.messages[0].id).toEqual('message-1');
      expect(channel.messages[1].id).toEqual('new-message');
      expect(channel.messages[2].id).toEqual('second-new-message');
    });

    it('adds all messages to multiple channels', async () => {
      const channelId1 = 'channel-1';
      const channelId2 = 'channel-2';
      const eventPayloads = [
        { channelId: channelId1, message: { id: '1-1', message: 'a new message' } },
        { channelId: channelId1, message: { id: '1-2', message: 'another' } },
        { channelId: channelId2, message: { id: '2-1', message: 'another' } },
        { channelId: channelId2, message: { id: '2-2', message: 'another' } },
      ];

      const initialState = new StoreBuilder().withConversationList(
        { id: channelId1, messages: [{ id: 'message-1', message: 'message_0001' }] as any },
        { id: channelId2, messages: [{ id: 'message-2', message: 'message_0002' }] as any }
      );

      const { storeState } = await subject(batchedReceiveNewMessage, eventPayloads)
        .provide([
          stubResponse(call(getMessageEmojiReactions, channelId1), [{}]),
          stubResponse(call(getMessageEmojiReactions, channelId2), [{}]),
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      const channel1 = denormalizeChannel(channelId1, storeState);
      expect(channel1.messages[0].id).toEqual('message-1');
      expect(channel1.messages[1].id).toEqual('1-1');
      expect(channel1.messages[2].id).toEqual('1-2');
      const channel2 = denormalizeChannel(channelId2, storeState);
      expect(channel2.messages[0].id).toEqual('message-2');
      expect(channel2.messages[1].id).toEqual('2-1');
      expect(channel2.messages[2].id).toEqual('2-2');
    });

    it('only adds a new message to the list once if the same message is received multiple times in batch', async () => {
      const channelId = 'channel-id';
      const eventPayloads = [
        { channelId, message: { id: 'new-message', message: 'a new message' } },
        { channelId, message: { id: 'new-message', message: 'second event' } },
      ];

      const existingMessages = [{ id: 'message-1', message: 'message_0001' }] as any;
      const initialState = new StoreBuilder().withConversationList({ id: channelId, messages: existingMessages });

      const { storeState } = await subject(batchedReceiveNewMessage, eventPayloads)
        .provide([
          stubResponse(call(getMessageEmojiReactions, channelId), [{}]),
        ])
        .withReducer(rootReducer, initialState.build())
        .run();

      const channel = denormalizeChannel(channelId, storeState);
      expect(channel.messages.map((m) => m.id)).toEqual(['message-1', 'new-message']);
      // Should favor the second event as it's the most recent
      expect(channel.messages[1].message).toEqual('second event');
    });
  });
});
