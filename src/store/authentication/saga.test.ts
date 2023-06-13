import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setUser } from '.';
import {
  nonceOrAuthorize,
  terminate,
  getCurrentUserWithChatAccessToken,
  initializeUserState,
  clearUserState,
  logout,
  redirectUnauthenticatedUser,
  completeUserLogin,
} from './saga';
import {
  nonceOrAuthorize as nonceOrAuthorizeApi,
  fetchCurrentUser,
  clearSession as clearSessionApi,
  fetchChatAccessToken,
} from './api';
import { reducer } from '.';
import { setChatAccessToken } from '../chat';
import { fetch as fetchNotifications } from '../notifications';
import { receive } from '../channels-list';
import { update } from '../layout';
import { rootReducer } from '../reducer';
import { clearNotifications } from '../notifications/saga';
import { clearChannelsAndConversations } from '../channels-list/saga';
import { clearUserLayout } from '../layout/saga';
import { clearMessages } from '../messages/saga';
import { clearUsers } from '../users/saga';
import { updateConnector } from '../web3/saga';
import { Connectors } from '../../lib/web3';

const currentUserResponse = {
  userId: 'id-1',
  id: 'id-1',
};

const chatAccessTokenResponse = {
  chatAccessToken: 'abc-a123',
};

describe(nonceOrAuthorize, () => {
  const signedWeb3Token = '0x000000000000000000000000000000000000000A';
  const authorizationResponse = {
    accessToken: 'eyJh-access-token',
    chatAccessToken: 'chat-access-token',
  };

  const nonceResponse = {
    nonceToken: 'expiring-nonce-token',
  };

  it('completes authentication when tokens are returned', async () => {
    await expectSaga(nonceOrAuthorize, { payload: { signedWeb3Token } })
      .provide([
        [
          call(nonceOrAuthorizeApi, signedWeb3Token),
          authorizationResponse,
        ],
        [
          matchers.call.fn(completeUserLogin),
          null,
        ],
      ])
      .put(setChatAccessToken({ value: authorizationResponse.chatAccessToken, isLoading: false }))
      .call(completeUserLogin)
      .run();
  });

  it('nonceOrAuthorize with nonceToken', async () => {
    await expectSaga(nonceOrAuthorize, { payload: { signedWeb3Token } })
      .provide([
        [
          call(nonceOrAuthorizeApi, signedWeb3Token),
          nonceResponse,
        ],
      ])
      .call(nonceOrAuthorizeApi, signedWeb3Token)
      .put(setUser({ nonce: nonceResponse.nonceToken, data: null }))
      .run();
  });
});

describe('terminate', () => {
  it('verifies terminate orchestration', async () => {
    await expectSaga(terminate)
      .provide([
        [
          matchers.call.fn(clearSessionApi),
          true,
        ],
        [
          matchers.call.fn(redirectUnauthenticatedUser),
          null,
        ],
      ])
      .call(clearSessionApi)
      .put(setUser({ data: null, isLoading: false, nonce: null }))
      .put(setChatAccessToken({ value: null, isLoading: false }))
      .withReducer(rootReducer)
      .run();
  });

  it('clears the user state', async () => {
    await expectSaga(terminate)
      .provide([
        [
          matchers.call.fn(clearSessionApi),
          true,
        ],
        [
          matchers.call.fn(redirectUnauthenticatedUser),
          null,
        ],
      ])
      .spawn(clearUserState)
      .withReducer(rootReducer)
      .run();
  });
});

describe('getCurrentUserWithChatAccessToken', () => {
  it('stores user', async () => {
    const { storeState } = await expectSaga(getCurrentUserWithChatAccessToken)
      .provide([
        [
          matchers.call.fn(fetchCurrentUser),
          currentUserResponse,
        ],
        [
          matchers.call.fn(fetchChatAccessToken),
          chatAccessTokenResponse,
        ],
      ])
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      user: { data: currentUserResponse },
    });
  });

  it('initializes the user state', async () => {
    await expectSaga(getCurrentUserWithChatAccessToken)
      .provide([
        [
          matchers.call.fn(fetchCurrentUser),
          currentUserResponse,
        ],
        [
          matchers.call.fn(fetchChatAccessToken),
          chatAccessTokenResponse,
        ],
      ])
      .spawn(initializeUserState, currentUserResponse)
      .run();
  });

  it('fetch notification', async () => {
    await expectSaga(getCurrentUserWithChatAccessToken)
      .provide([
        [
          matchers.call.fn(fetchCurrentUser),
          currentUserResponse,
        ],
        [
          matchers.call.fn(fetchChatAccessToken),
          chatAccessTokenResponse,
        ],
      ])
      .spawn(initializeUserState, currentUserResponse)
      .put(fetchNotifications({ userId: currentUserResponse.id }))
      .run();
  });
});

describe('clearUserState', () => {
  it('resets layout', async () => {
    await expectSaga(clearUserState)
      .put(update({ isSidekickOpen: false, isMessengerFullScreen: false }))
      .put(receive([]))
      .withReducer(rootReducer)
      .run();
  });

  it('verifies state reset calls', async () => {
    await expectSaga(clearUserState)
      .call(clearChannelsAndConversations)
      .call(clearMessages)
      .call(clearUsers)
      .call(clearNotifications)
      .call(clearUserLayout)
      .withReducer(rootReducer)
      .run();
  });
});

describe('logout', () => {
  function expectLogoutSaga() {
    return expectSaga(logout).provide([
      [
        matchers.call.fn(updateConnector),
        null,
      ],
      [
        call(terminate),
        null,
      ],
    ]);
  }

  it('clears the web3 connection', async () => {
    await expectLogoutSaga().call(updateConnector, { payload: Connectors.None }).run();
  });

  it('clears the user session', async () => {
    await expectLogoutSaga().call(terminate).run();
  });
});
