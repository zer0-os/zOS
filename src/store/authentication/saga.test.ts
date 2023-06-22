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
  publishUserLogin,
  publishUserLogout,
  authenticateByEmail,
  setAuthentication,
} from './saga';
import {
  nonceOrAuthorize as nonceOrAuthorizeApi,
  fetchCurrentUser,
  clearSession as clearSessionApi,
  fetchChatAccessToken,
  emailLogin,
} from './api';
import { reducer } from '.';
import { setChatAccessToken } from '../chat';
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

describe(completeUserLogin, () => {
  it('loads the user info', async () => {
    const { storeState } = await expectSaga(completeUserLogin)
      .provide([
        stubResponse(call(fetchCurrentUser), { fake: 'user-response' }),
        ...successResponses(),
      ])
      .withReducer(rootReducer)
      .run();

    expect(storeState.authentication.user).toMatchObject({ data: { fake: 'user-response' } });
  });

  it('sets up user state', async () => {
    await expectSaga(completeUserLogin)
      .provide([
        stubResponse(call(fetchCurrentUser), { fake: 'user-response' }),
        ...successResponses(),
      ])
      .call(initializeUserState, { fake: 'user-response' })
      .run();
  });

  it('publishes user login event', async () => {
    await expectSaga(completeUserLogin)
      .provide([
        stubResponse(call(fetchCurrentUser), { fake: 'user-response' }),
        ...successResponses(),
      ])
      .call(publishUserLogin, { fake: 'user-response' })
      .run();
  });

  function successResponses() {
    return [
      [
        call(fetchCurrentUser),
        { user: 'stubbed' },
      ],
      [
        matchers.call.fn(initializeUserState),
        null,
      ],
      [
        matchers.call.fn(publishUserLogin),
        null,
      ],
    ] as any;
  }
});

describe('terminate', () => {
  it('clears authentication state', async () => {
    const { storeState } = await expectSaga(terminate)
      .provide([...successResponses()])
      .withReducer(rootReducer)
      .run();

    expect(storeState.authentication.user).toMatchObject({ data: null, nonce: null });
  });

  it('clears the user state', async () => {
    await expectSaga(terminate)
      .provide([...successResponses()])
      .call(clearUserState)
      .run();
  });

  it('redirects the user to the appropriate landing page', async () => {
    await expectSaga(terminate, true)
      .provide([...successResponses()])
      .call(redirectUnauthenticatedUser, true)
      .run();
  });

  it('publishes the user logout event', async () => {
    await expectSaga(terminate)
      .provide([...successResponses()])
      .call(publishUserLogout)
      .run();
  });

  it('clears the user cookie', async () => {
    await expectSaga(terminate)
      .provide([...successResponses()])
      .call(clearSessionApi)
      .run();
  });

  function successResponses() {
    return [
      [
        matchers.call.fn(clearSessionApi),
        true,
      ],
      [
        matchers.call.fn(redirectUnauthenticatedUser),
        null,
      ],
    ] as any;
  }
});

describe(getCurrentUserWithChatAccessToken, () => {
  it('sets the user state', async () => {
    const { storeState } = await expectSaga(getCurrentUserWithChatAccessToken)
      .provide([
        stubResponse(call(fetchCurrentUser), { stub: 'user-data' }),
        ...successResponses(),
      ])
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      user: { data: { stub: 'user-data' } },
    });
  });

  it('sets the authentication state', async () => {
    const { storeState } = await expectSaga(getCurrentUserWithChatAccessToken)
      .provide([
        stubResponse(call(fetchChatAccessToken), { chatAccessToken: 'token' }),
        ...successResponses(),
      ])
      .withReducer(rootReducer)
      .run();

    // Maybe we should just test that we called it since we don't own this state?
    expect(storeState.chat.chatAccessToken.value).toEqual('token');
  });

  it('returns false if fetching the user fails. I.E., the user is not logged in.', async () => {
    const { returnValue } = await expectSaga(getCurrentUserWithChatAccessToken)
      .provide([
        stubResponse(call(fetchChatAccessToken), null),
        ...successResponses(),
      ])
      .run();

    expect(returnValue).toEqual(false);
  });

  function successResponses() {
    return [
      [
        matchers.call.fn(fetchCurrentUser),
        { userId: 'id-1', id: 'id-1' },
      ],
      [
        matchers.call.fn(fetchChatAccessToken),
        { chatAccessToken: 'abc-a123' },
      ],
    ] as any;
  }
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

describe(authenticateByEmail, () => {
  it('completes the whole auth process', async () => {
    const email = 'valid email';
    const password = 'valid password';
    const chatAccessToken = 'token';
    const { returnValue } = await expectSaga(authenticateByEmail, email, password)
      .provide([
        stubResponse(call(emailLogin, { email, password }), { success: true, response: { chatAccessToken } }),
        ...successResponses(),
      ])
      .call(setAuthentication, { chatAccessToken })
      .call(completeUserLogin)
      .run();

    expect(returnValue.success).toEqual(true);
  });

  it('returns errors result if login failed', async () => {
    const email = 'invalid email';
    const password = 'invalid password';
    const { returnValue } = await expectSaga(authenticateByEmail, email, password)
      .provide([stubResponse(call(emailLogin, { email, password }), { success: false, error: 'something' })])
      .run();

    expect(returnValue).toEqual({ success: false, error: 'something' });
  });

  function successResponses() {
    return [
      [
        matchers.call.fn(emailLogin),
        { success: true },
      ],
      [
        matchers.call.fn(setAuthentication),
        null,
      ],
      [
        matchers.call.fn(completeUserLogin),
        null,
      ],
    ] as any;
  }
});

function stubResponse(matcher, response) {
  return [
    matcher,
    response,
  ] as any;
}
