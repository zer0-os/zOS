import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { getChatAccessToken } from './saga';
import { fetchChatAccessToken } from './api';
import { ChatAccessTokenResponse } from './types';

const chatAccessTokenResponse: ChatAccessTokenResponse = {
  chatAccessToken: 'access-token-for-chat',
  accountCreated: false,
};

describe('chat saga', () => {
  it('getChatAccessToken', async () => {
    await expectSaga(getChatAccessToken)
      .provide([
        [
          matchers.call.fn(fetchChatAccessToken),
          chatAccessTokenResponse,
        ],
      ])
      .call(fetchChatAccessToken)
      .run();
  });
});
