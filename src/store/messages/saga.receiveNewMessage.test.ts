import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { call } from 'redux-saga/effects';

import { getLinkPreviews } from './api';
import { getPreview, receiveNewMessage, sendBrowserNotification } from './saga';
import { rootReducer } from '../reducer';

import { denormalize as denormalizeChannel } from '../channels';
import { stubResponse } from '../../test/saga';
import { markChannelAsReadIfActive, markConversationAsReadIfActive } from '../channels/saga';
import { StoreBuilder } from '../test/store';

describe(receiveNewMessage, () => {
  it('adds the message to the channel', async () => {
    const channelId = 'channel-id';
    const message = { id: 'new-message', message: 'a new message', optimisticId: 'other-front-end-id' };
    const existingMessages = [{ id: 'message-1', message: 'message_0001' }] as any;
    const initialState = new StoreBuilder().withConversationList({ id: channelId, messages: existingMessages });

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide(successResponses())
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

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        stubResponse(call(getPreview, 'www.google.com'), stubPreview),
        ...successResponses(),
      ])
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(stubPreview);
  });

  it('does nothing if the channel does not exist', async () => {
    const channelId = 'non-existing-channel-id';
    const initialState = new StoreBuilder().withConversationList({ id: 'other-channel' });

    await expectSaga(receiveNewMessage, { payload: { channelId, message: {} } })
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

    await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .withReducer(rootReducer, initialState.build())
      .not.put.like({ action: { type: 'normalized/receive' } })
      .run();
  });

  it('sends a browser notification', async () => {
    const message = { id: 'message-id', message: '' };
    const initialState = new StoreBuilder().withConversationList({ id: 'channel-id' });

    await expectSaga(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .provide(successResponses())
      .withReducer(rootReducer, initialState.build())
      .spawn(sendBrowserNotification, 'channel-id', message)
      .run();
  });

  it('calls markAsReadAction when new message is received', async () => {
    const message = { id: 'message-id', message: '' };

    const channelState = new StoreBuilder().withChannelList({ id: 'channel-id' });

    await expectSaga(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .provide(successResponses())
      .withReducer(rootReducer, channelState.build())
      .call(markChannelAsReadIfActive, { payload: { channelId: 'channel-id' } })
      .run();

    const conversationState = new StoreBuilder().withConversationList({ id: 'channel-id' });
    await expectSaga(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .provide(successResponses())
      .withReducer(rootReducer, conversationState.build())
      .call(markConversationAsReadIfActive, { payload: { channelId: 'channel-id' } })
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

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide(successResponses())
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

    const { storeState } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide(successResponses())
      .withReducer(rootReducer, initialState.build())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].id).toEqual('optimistic-id-1');
    expect(channel.messages[1].id).toEqual('system-provided-id');
  });
});

function successResponses() {
  return [
    stubResponse(matchers.call.fn(getLinkPreviews), null),
    stubResponse(matchers.spawn.fn(sendBrowserNotification), undefined),
    stubResponse(matchers.call.fn(markConversationAsReadIfActive), undefined),
  ] as any;
}
