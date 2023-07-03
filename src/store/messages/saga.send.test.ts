import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { getLinkPreviews, sendMessagesByChannelId } from './api';
import { send } from './saga';
import { RootState, rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';
import { denormalize as denormalizeChannel, normalize as normalizeChannel } from '../channels';
import { throwError } from 'redux-saga-test-plan/providers';

describe(send, () => {
  it('sends a basic text message', async () => {
    const channelId = 'channel-id';
    const message = 'hello';

    await expectSaga(send, { payload: { channelId, message } })
      .provide(successResponses())
      .withReducer(rootReducer, defaultState())
      .call(sendMessagesByChannelId, channelId, message, undefined, undefined)
      .run();
  });

  it('sends a basic text message with mentioned users', async () => {
    const channelId = 'channel-id';
    const message = 'hello';
    const mentionedUserIds = ['user-id'];

    await expectSaga(send, { payload: { channelId, message, mentionedUserIds } })
      .provide(successResponses())
      .withReducer(rootReducer, defaultState())
      .call(sendMessagesByChannelId, channelId, message, mentionedUserIds, undefined)
      .run();
  });

  it('sends a message that is a reply', async () => {
    const channelId = 'channel-id';
    const parentMessage = { message: 'hello', messageId: '98765650', userId: '12YT67565J' };

    await expectSaga(send, { payload: { channelId, parentMessage } })
      .provide(successResponses())
      .withReducer(rootReducer, defaultState() as any)
      .call(sendMessagesByChannelId, channelId, undefined, undefined, parentMessage)
      .run();
  });

  it('creates an optimistic message', async () => {
    const channelId = 'channel-id';
    const message = 'test message';

    const { storeState } = await expectSaga(send, { payload: { channelId, message } })
      .provide([
        ...successResponses(),
      ])
      .withReducer(rootReducer, defaultState())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].message).toEqual(message);
    expect(channel.messages[0].id).not.toBeNull();
    expect(channel.messages[0].sender).not.toBeNull();
  });

  it('adds a link preview to the optimistic message', async () => {
    const channelId = 'channel-id';
    const message = 'www.google.com';

    const linkPreview = { id: 'fdf2ce2b-062e-4a83-9c27-03f36c81c0c0' };

    const { storeState } = await expectSaga(send, { payload: { channelId, message } })
      .provide([
        stubResponse(matchers.call.fn(getLinkPreviews), linkPreview),
        ...successResponses(),
      ])
      .withReducer(rootReducer, defaultState())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(linkPreview);
  });

  it('resets the existing messages if the send call fails', async () => {
    const channelId = 'channel-id';
    const existingMessages = [
      { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
    ];

    const initialState = {
      ...existingChannelState({ id: channelId, messages: existingMessages }),
      ...defaultState(),
    };

    const { storeState } = await expectSaga(send, { payload: { channelId, message: 'failed message' } })
      .withReducer(rootReducer, initialState)
      .provide([
        stubResponse(matchers.call.fn(sendMessagesByChannelId), throwError(new Error('api call failed'))),
      ])
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toStrictEqual(existingMessages);
  });

  it('resets the lastMessage information if the send call fails', async () => {
    const channelId = 'channel-id';
    const existingMessages = [
      { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
    ];

    const initialState = {
      ...existingChannelState({ id: channelId, messages: existingMessages }),
      ...defaultState(),
    };

    const { storeState } = await expectSaga(send, { payload: { channelId, message: 'failed message' } })
      .withReducer(rootReducer, initialState)
      .provide([
        stubResponse(matchers.call.fn(sendMessagesByChannelId), throwError(new Error('api call failed'))),
      ])
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
  };
}

function successResponses() {
  return [
    stubResponse(matchers.call.fn(sendMessagesByChannelId), { status: 200, body: { id: 'message 1', message: {} } }),
  ];
}
