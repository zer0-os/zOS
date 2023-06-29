import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { getLinkPreviews, sendMessagesByChannelId } from './api';
import { send } from './saga';
import { RootState, rootReducer } from '../reducer';
import { stubResponse } from '../../test/saga';

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

    const {
      storeState: {
        normalized: { channels, messages },
      },
    } = await expectSaga(send, { payload: { channelId, message, mentionedUserIds, parentMessage } })
      .provide([
        [
          matchers.call.fn(getLinkPreviews),
          {
            status: 200,
            body: {
              id: 'fdf2ce2b-062e-4a83-9c27-03f36c81c0c0',
              url: 'http://www.google.com',
              type: 'link',
              title: 'Google',
              description: 'Search the world information, including webpages.',
            },
          },
        ],
        ...successResponses(),
      ])
      .withReducer(rootReducer, defaultState() as any)
      .call(sendMessagesByChannelId, channelId, message, mentionedUserIds, parentMessage)
      .run();

    const messageId = channels[channelId]['messages'][0];
    expect(messages[messageId].preview).not.toBeNull();
  });

  it('reply message', async () => {
    const channelId = 'channel-id';
    const message = 'reply';
    const mentionedUserIds = [];
    const parentMessage = { message: 'hello', messageId: '98765650', userId: '12YT67565J' };

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(send, { payload: { channelId, message, mentionedUserIds, parentMessage } })
      .provide(successResponses())
      .withReducer(rootReducer, defaultState() as any)
      .call(sendMessagesByChannelId, channelId, message, mentionedUserIds, parentMessage)
      .run();
    expect(channels[channelId].messageIdsCache).not.toStrictEqual([]);
  });

  it('send message return a 400 status', async () => {
    const channelId = 'channel-id';
    const message = 'hello';
    const mentionedUserIds = ['ef698a51-1cea-42f8-a078-c0f96ed03c9e'];
    const parentMessage = null;
    const messages = [
      { id: 'message 1', message: 'message_0001', createdAt: 10000000007 },
      { id: 'message 2', message: 'message_0002', createdAt: 10000000008 },
      { id: 'message 3', message: 'message_0003', createdAt: 10000000009 },
    ];

    const initialState = {
      normalized: {
        channels: {
          [channelId]: {
            id: channelId,
            messages,
          },
        },
      },
      ...defaultState(),
    };

    const {
      storeState: {
        normalized: { channels },
      },
    } = await expectSaga(send, { payload: { channelId, message, mentionedUserIds, parentMessage } })
      .withReducer(rootReducer, initialState)
      .provide([stubResponse(matchers.call.fn(sendMessagesByChannelId), { status: 400, body: {} })])
      .call(sendMessagesByChannelId, channelId, message, mentionedUserIds, parentMessage)
      .run();

    expect(channels[channelId].messages).toStrictEqual(messages.map((messageItem) => messageItem.id));
    expect(channels[channelId].messageIdsCache.length).toEqual(1);
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
