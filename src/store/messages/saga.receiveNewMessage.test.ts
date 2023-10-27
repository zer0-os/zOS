import delayP from '@redux-saga/delay-p';
import * as matchers from 'redux-saga-test-plan/matchers';
import { call } from 'redux-saga/effects';

import { getLinkPreviews } from './api';
import { getPreview, receiveNewMessage, sendBrowserNotification } from './saga';
import { rootReducer } from '../reducer';

import { denormalize as denormalizeChannel } from '../channels';
import { expectSaga, stubResponse } from '../../test/saga';
import { markChannelAsRead, markConversationAsRead } from '../channels/saga';
import { StoreBuilder } from '../test/store';

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
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('message-1');
    expect(channel.messages[1].id).toEqual('new-message');
  });

  it('adds the link previews to the message', async () => {
    const channelId = 'channel-id';
    const message = { id: 'message-id', message: 'www.google.com' };
    const stubPreview = { id: 'simulated-preview' };
    const initialState = new StoreBuilder().withConversationList({ id: channelId });

    const { storeState } = await subject(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getPreview, 'www.google.com'), stubPreview),
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(stubPreview);
  });

  it('does nothing if the channel does not exist', async () => {
    const channelId = 'non-existing-channel-id';
    const initialState = new StoreBuilder().withConversationList({ id: 'other-channel' });

    await subject(receiveNewMessage, { payload: { channelId, message: {} } })
      .withReducer(rootReducer, initialState.build())
      .not.put.like({ action: { type: 'normalized/receive' } })
      .run();
  });

  it('does nothing if we already have the messsage', async () => {
    const channelId = 'channel-id';
    const message = { id: 'new-message', message: 'message_0001' };
    const existingMessages = [
      { id: 'new-message', message: 'message_0001' },
      { id: 'other-message', message: 'message_0002' },
    ] as any;
    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages: existingMessages });

    await subject(receiveNewMessage, { payload: { channelId, message } })
      .withReducer(rootReducer, initialState.build())
      .not.put.like({ action: { type: 'normalized/receive' } })
      .run();
  });

  it('calls markAsReadAction when new message is received', async () => {
    const message = { id: 'message-id', message: '' };

    const channelState = new StoreBuilder()
      .withChannelList({ id: 'channel-id' })
      .withActiveChannel({ id: 'channel-id' });

    await subject(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .withReducer(rootReducer, channelState.build())
      .spawn(markChannelAsRead, 'channel-id')
      .run();

    const conversationState = new StoreBuilder()
      .withConversationList({ id: 'channel-id' })
      .withActiveConversation({ id: 'channel-id' });

    await subject(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .withReducer(rootReducer, conversationState.build())
      .spawn(markConversationAsRead, 'channel-id')
      .run();
  });

  it('does not call markChannelAsRead when new message is received but channel is NOT active', async () => {
    const message = { id: 'message-id', message: '' };

    const channelState = new StoreBuilder().withChannelList({ id: 'channel-id' });

    await subject(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .withReducer(rootReducer, channelState.build())
      .not.call(markChannelAsRead, 'channel-id')
      .run();
  });

  it('does not call markConversationAsRead when new message is received but conversation is NOT active', async () => {
    const message = { id: 'message-id', message: '' };
    const conversationState = new StoreBuilder().withConversationList({ id: 'channel-id' });

    await subject(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
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
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('optimistic-id-1');
    expect(channel.messages[1].id).toEqual('system-provided-id');
  });
});
