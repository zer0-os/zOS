import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { getLinkPreviews, sendMessagesByChannelId } from './api';
import { send } from './saga';
import { RootState, rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';
import { denormalize as denormalizeChannel } from '../channels';

describe(send, () => {
  it('send message', async () => {
    const channelId = 'channel-id';
    const message = 'hello';
    const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];
    const parentMessage = null;

    await expectSaga(send, { payload: { channelId, message, mentionedUserIds, parentMessage } })
      .provide(successResponses())
      .withReducer(rootReducer, defaultState())
      .call(sendMessagesByChannelId, channelId, message, mentionedUserIds, parentMessage)
      .run();
  });

  it('send message with link preview', async () => {
    const channelId = 'channel-id';
    const message = 'www.google.com';
    const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];
    const parentMessage = null;

    const linkPreview = { id: 'fdf2ce2b-062e-4a83-9c27-03f36c81c0c0' };

    const { storeState } = await expectSaga(send, { payload: { channelId, message, mentionedUserIds, parentMessage } })
      .provide([
        stubResponse(matchers.call.fn(getLinkPreviews), linkPreview),
        ...successResponses(),
      ])
      .withReducer(rootReducer, defaultState())
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages[0].preview).toEqual(linkPreview);
  });

  it('reply message', async () => {
    const channelId = 'channel-id';
    const parentMessage = { message: 'hello', messageId: '98765650', userId: '12YT67565J' };

    await expectSaga(send, { payload: { channelId, message: '', mentionedUserIds: [], parentMessage } })
      .provide(successResponses())
      .withReducer(rootReducer, defaultState() as any)
      .call(sendMessagesByChannelId, channelId, '', [], parentMessage)
      .run();
  });

  it('send message return a 400 status', async () => {
    const channelId = 'channel-id';
    const existingMessages = [
      { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
    ];

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            messages: existingMessages,
          },
        },
      },
      ...defaultState(),
    };

    const { storeState } = await expectSaga(send, { payload: { channelId, message: 'failed message' } })
      .withReducer(rootReducer, initialState)
      .provide([stubResponse(matchers.call.fn(sendMessagesByChannelId), { status: 400, body: {} })])
      .run();

    const channel = denormalizeChannel(channelId, storeState);
    expect(channel.messages).toStrictEqual(existingMessages);
    // Is this what we really want? Just leave the optimistic message hanging around?
    expect(channel.messageIdsCache.length).toEqual(1);
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

function successResponses() {
  return [
    stubResponse(matchers.call.fn(sendMessagesByChannelId), { status: 200, body: { id: 'message 1', message: {} } }),
  ];
}
