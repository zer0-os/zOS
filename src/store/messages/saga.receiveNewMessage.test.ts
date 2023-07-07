import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { call } from 'redux-saga/effects';

import { getLinkPreviews } from './api';
import { getPreview, receiveNewMessage, sendBrowserNotification } from './saga';
import { RootState, rootReducer } from '../reducer';

import { denormalize as denormalizeChannel, normalize as normalizeChannel } from '../channels';
import { stubResponse } from '../../test/saga';
import { markConversationAsReadIfActive } from '../channels/saga';

describe(receiveNewMessage, () => {
  it('adds the message to the channel', async () => {
    const channelId = 'channel-id';
    const message = { id: 'new-message', message: 'a new message' };
    const existingMessages = [{ id: 'message-1', message: 'message_0001' }];

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide(successResponses())
      .withReducer(rootReducer, existingChannelState({ id: channelId, messages: existingMessages }))
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('message-1');
    expect(channel.messages[1].id).toEqual('new-message');
  });

  it('adds the link previews to the message', async () => {
    const channelId = 'channel-id';
    const message = { id: 'message-id', message: 'www.google.com' };
    const stubPreview = { id: 'simulated-preview' };

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getPreview, 'www.google.com'), stubPreview),
        ...successResponses(),
      ])
      .withReducer(rootReducer, existingChannelState({ id: channelId }))
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(stubPreview);
  });

  it('does nothing if the channel does not exist', async () => {
    const channelId = 'non-existing-channel-id';

    await expectSaga(receiveNewMessage, { payload: { channelId, message: {} } })
      .withReducer(rootReducer, existingChannelState({ id: 'other-channel' }))
      .not.put.like({ action: { type: 'normalized/receive' } })
      .run();
  });

  it('does nothing if we already have the messsage', async () => {
    const channelId = 'channel-id';
    const message = { id: 'new-message', message: 'message_0001' };
    const existingMessages = [
      { id: 'new-message', message: 'message_0001' },
      { id: 'other-message', message: 'message_0002' },
    ];

    await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .withReducer(rootReducer, existingChannelState({ id: channelId, messages: existingMessages }))
      .not.put.like({ action: { type: 'normalized/receive' } })
      .run();
  });

  it('sets the lastMessage and lastMessageCreatedAt if it is now the most recent message', async () => {
    const channelId = 'channel-id';
    const message = { id: 'new-message', message: '', createdAt: 10000007 };
    const existingMessages = [
      { id: 'other-message', message: '', createdAt: 10000005 },
    ];

    const initialState = existingChannelState({
      id: channelId,
      messages: existingMessages,
      lastMessage: existingMessages[0],
      lastMessageCreatedAt: existingMessages[0].createdAt,
    });

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide(successResponses())
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.lastMessage).toEqual(message);
    expect(channel.lastMessageCreatedAt).toEqual(message.createdAt);
  });

  it('does not set the lastMessage and lastMessageAt if the received message is earlier than the latest', async () => {
    const channelId = 'channel-id';
    const message = { id: 'new-message', message: 'message text', createdAt: 10000001 };
    const existingMessages = [
      { id: 'other-message', message: 'message_0001', createdAt: 10000005 },
    ];

    const initialState = existingChannelState({
      id: channelId,
      messages: existingMessages,
      lastMessage: existingMessages[0],
      lastMessageCreatedAt: existingMessages[0].createdAt,
    });

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide(successResponses())
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.lastMessage).toEqual(existingMessages[0]);
    expect(channel.lastMessageCreatedAt).toEqual(existingMessages[0].createdAt);
  });

  it('sends a browser notification', async () => {
    const message = { id: 'message-id', message: '' };

    await expectSaga(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .provide(successResponses())
      .withReducer(rootReducer, existingChannelState({ id: 'channel-id' }))
      .spawn(sendBrowserNotification, 'channel-id', message)
      .run();
  });

  it('replaces optimistically rendered message', async () => {
    const channelId = 'channel-id';
    const message = { id: 'system-provided-id', message: 'true message for asserting. normally would not change.' };
    const existingMessages = [
      { id: 'optimistic-id', message: 'optimistic' },
      { id: 'standard-id', message: 'message_0001' },
    ];

    const initialState = existingChannelState({
      id: channelId,
      messages: existingMessages,
      messageIdsCache: ['optimistic-id'],
    });

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide(successResponses())
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('system-provided-id');
    expect(channel.messages[0].message).toEqual('true message for asserting. normally would not change.');
    expect(channel.messages[1].id).toEqual('standard-id');
    expect(channel.messageIdsCache).toEqual([]);
  });

  it('replaces first found optimistically rendered message even if more messages have been sent', async () => {
    // Note: This is a bug. We should replace exactly the message we rendered optimistically.
    // For now, this tests current behavior. Fixes to come.
    const channelId = 'channel-id';
    const message = { id: 'system-provided-id', message: 'true message for asserting. normally would not change.' };
    const existingMessages = [
      { id: 'optimistic-id-1', message: 'optimistic1' },
      { id: 'optimistic-id-2', message: 'optimistic2' },
      { id: 'standard-id', message: 'message_0001' },
    ];

    const initialState = existingChannelState({
      id: channelId,
      messages: existingMessages,
      messageIdsCache: [
        'optimistic-id-1',
        'optimistic-id-2',
      ],
    });

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide(successResponses())
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('system-provided-id');
    expect(channel.messageIdsCache).toEqual(['optimistic-id-2']);
  });
});

function successResponses() {
  return [
    stubResponse(matchers.call.fn(getLinkPreviews), null),
    stubResponse(matchers.spawn.fn(sendBrowserNotification), undefined),
    stubResponse(matchers.call.fn(markConversationAsReadIfActive), undefined),
  ] as any;
}

function existingChannelState(channel) {
  const normalized = normalizeChannel(channel);
  return {
    normalized: {
      ...normalized.entities,
    },
  } as RootState;
}
