import { call } from 'redux-saga/effects';
import { expectSaga, testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { getLinkPreviews, sendMessagesByChannelId } from './api';
import { createOptimisticMessage, createOptimisticPreview, messageSendFailed, send } from './saga';
import { RootState, rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';
import { denormalize as denormalizeChannel, normalize as normalizeChannel } from '../channels';

describe(send, () => {
  it('creates optimistic message, fetches preview, then sends the message', async () => {
    const channelId = 'channel-id';
    const message = 'hello';
    const mentionedUserIds = [
      'user-id1',
      'user-id2',
    ];
    const parentMessage = { id: 'parent-id' };

    testSaga(send, { payload: { channelId, message, mentionedUserIds, parentMessage } })
      .next()
      .call(createOptimisticMessage, channelId, message, parentMessage)
      .next({ existingMessages: [], optimisticMessage: { id: 'optimistic-message-id' } })
      .call(createOptimisticPreview, channelId, { id: 'optimistic-message-id' })
      .next()
      .call(sendMessagesByChannelId, channelId, message, mentionedUserIds, parentMessage)
      .next()
      .isDone();
  });

  it('handles message send failure', async () => {
    const channelId = 'channel-id';
    const existingMessages = ['message1'];

    testSaga(send, { payload: { channelId } })
      .next()
      // .call(createOptimisticMessage, ignore call)
      .next({ existingMessages })
      // .call(createOptimisticPreview, ignore call)
      .next()
      // .call(sendMessagesByChannelId, ignore call)
      .throw(new Error('simulated api call failed'))
      .call(messageSendFailed, channelId, existingMessages)
      .next()
      .isDone();
  });
});

describe(createOptimisticMessage, () => {
  it('creates an optimistic message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';

    const { returnValue, storeState } = await expectSaga(createOptimisticMessage, channelId, message, undefined)
      .provide([...successResponses()])
      .withReducer(rootReducer, defaultState())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].message).toEqual(message);
    expect(channel.messages[0].id).not.toBeNull();
    expect(channel.messages[0].sender).not.toBeNull();
    expect(returnValue.optimisticMessage).toEqual(expect.objectContaining({ message: 'test message' }));
  });

  it('returns the initial set of messages', async () => {
    const channelId = 'channel-id';
    const existingMessages = [
      { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
    ];

    const initialState = {
      ...existingChannelState({ id: channelId, messages: existingMessages }),
      ...defaultState(),
    };

    const { returnValue } = await expectSaga(createOptimisticMessage, channelId, 'failed message', undefined)
      .provide([...successResponses()])
      .withReducer(rootReducer, initialState)
      .run();

    expect(returnValue.existingMessages).toEqual(existingMessages.map((m) => m.id));
  });
});

describe(createOptimisticPreview, () => {
  it('fetches the preview and adds it to the optimistic message', async () => {
    const channelId = 'channel-id';
    const optimisticMessage = { id: 'optimistic-id', message: 'example.com' };
    const linkPreview = { id: 'fdf2ce2b-062e-4a83-9c27-03f36c81c0c0' };

    const initialState = { ...existingChannelState({ id: channelId, messages: [optimisticMessage] }) };

    const { storeState } = await expectSaga(createOptimisticPreview, channelId, optimisticMessage)
      .provide([stubResponse(call(getLinkPreviews, 'http://example.com'), linkPreview)])
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(linkPreview);
  });
});

describe(messageSendFailed, () => {
  it('resets the existing messages if the send call fails', async () => {
    const channelId = 'channel-id';
    const existingMessages = [
      { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
    ];
    const optimisticMessageList = [
      ...existingMessages,
      { id: 'optimistic' },
    ];

    const initialState = {
      ...existingChannelState({ id: channelId, messages: optimisticMessageList }),
      ...defaultState(),
    };

    const { storeState } = await expectSaga(messageSendFailed, channelId, existingMessages)
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toStrictEqual(existingMessages);
  });

  it('resets the lastMessage information if the send call fails', async () => {
    const channelId = 'channel-id';
    const existingMessages = [
      { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
    ];
    const optimisticChannel = {
      id: channelId,
      lastMessage: { id: 'optimistic' },
      lastMessageCreatedAt: 10000000010,
    };

    const initialState = {
      ...existingChannelState(optimisticChannel),
      ...defaultState(),
    };

    const { storeState } = await expectSaga(messageSendFailed, channelId, existingMessages)
      .withReducer(rootReducer, initialState)
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.lastMessage).toEqual(expect.objectContaining(existingMessages[0]));
    expect(channel.lastMessageCreatedAt).toStrictEqual(existingMessages[0].createdAt);
  });
});

function defaultState() {
  return {
    authentication: {
      user: {
        data: {
          id: '1',
          profileId: '2',
          profileSummary: {
            firstName: 'Johnn',
            lastName: 'Doe',
            profileImage: '/image.jpg',
          },
        },
      },
    },
  } as RootState;
}

function existingChannelState(channel) {
  const normalized = normalizeChannel(channel);
  return {
    normalized: {
      ...normalized.entities,
    },
  } as RootState;
}

function successResponses() {
  return [
    stubResponse(matchers.call.fn(sendMessagesByChannelId), { status: 200, body: { id: 'message 1', message: {} } }),
  ];
}
