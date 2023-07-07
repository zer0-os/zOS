import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { getLinkPreviews } from './api';
import { receiveNewMessage } from './saga';
import { rootReducer } from '../reducer';

import { mapMessage, send as sendBrowserNotification } from '../../lib/browser';

describe(receiveNewMessage, () => {
  it('receive new message with link preview', async () => {
    const channelId = '0x000000000000000000000000000000000000000A';
    const message = {
      id: 8667728016,
      message: 'www.google.com',
      parentMessageText: null,
      createdAt: 1678861267433,
      updatedAt: 0,
    };

    const initialState = {
      authentication: {
        user: {
          data: {
            id: 1,
            profileId: '2',
            profileSummary: {
              firstName: 'Johnn',
              lastName: 'Doe',
              profileImage: '/image.jpg',
            },
          },
        },
      },
    };

    const {
      storeState: {
        normalized: { channels, messages },
      },
    } = await expectSaga(receiveNewMessage, { payload: { channelId, message } })
      .provide([
        [
          matchers.call.fn(getLinkPreviews),
          {
            id: 'fdf2ce2b-062e-4a83-9c27-03f36c81c0c0',
            url: 'http://www.google.com',
            type: 'link',
            title: 'Google',
            description: 'Search the world information, including webpages.',
          },
        ],
        [
          matchers.call.fn(sendBrowserNotification),
          undefined,
        ],
      ])
      .withReducer(rootReducer, initialState as any)
      .run();

    const messageId = channels[channelId]['messages'][0];
    expect(messages[messageId].preview).not.toBeNull();
  });

  it('verify sendBrowserMessage on receive new message', async () => {
    const message = {
      id: 8667728016,
      message: 'Hello world!',
      parentMessageText: null,
      createdAt: 1678861267433,
      updatedAt: 0,
    };

    await expectSaga(receiveNewMessage, { payload: { channelId: 'channel-id', message } })
      .provide([
        [
          matchers.call.fn(getLinkPreviews),
          undefined,
        ],
        [
          matchers.call.fn(sendBrowserNotification),
          undefined,
        ],
      ])
      .call(sendBrowserNotification, mapMessage(message as any))
      .run();
  });
});
