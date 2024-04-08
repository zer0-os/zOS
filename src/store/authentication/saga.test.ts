import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setUser } from '.';
import {
  nonceOrAuthorize,
  terminate,
  getCurrentUser,
  clearUserState,
  forceLogout,
  redirectUnauthenticatedUser,
  completeUserLogin,
  publishUserLogin,
  publishUserLogout,
  authenticateByEmail,
  logoutRequest,
} from './saga';
import {
  nonceOrAuthorize as nonceOrAuthorizeApi,
  fetchCurrentUser,
  clearSession as clearSessionApi,
  emailLogin,
} from './api';
import { reducer } from '.';
import { receive } from '../channels-list';
import { rootReducer } from '../reducer';
import { clearChannelsAndConversations } from '../channels-list/saga';
import { clearMessages } from '../messages/saga';
import { clearUsers } from '../users/saga';
import { updateConnector } from '../web3/saga';
import { Connectors } from '../../lib/web3';
import { completePendingUserProfile } from '../registration/saga';
import { StoreBuilder } from '../test/store';
import { throwError } from 'redux-saga-test-plan/providers';

describe(nonceOrAuthorize, () => {
  const signedWeb3Token = '0x000000000000000000000000000000000000000A';
  const authorizationResponse = {
    accessToken: 'eyJh-access-token',
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

  it('completes the pending user profile if user is in pending state', async () => {
    const user = { isPending: true };
    await expectSaga(completeUserLogin)
      .provide([
        stubResponse(call(fetchCurrentUser), user),
        stubResponse(call(completePendingUserProfile, user), null),
        ...successResponses(),
      ])
      .withReducer(rootReducer)
      .call(completePendingUserProfile, user)
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

describe(getCurrentUser, () => {
  it('sets the user state', async () => {
    const { storeState } = await expectSaga(getCurrentUser)
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

  it('returns false if fetching the user fails. I.E., the user is not logged in.', async () => {
    const { returnValue } = await expectSaga(getCurrentUser)
      .provide([[matchers.call.fn(fetchCurrentUser), throwError(new Error('fetch user error'))]])
      .run();

    expect(returnValue).toEqual(false);
  });

  function successResponses() {
    return [
      [
        matchers.call.fn(fetchCurrentUser),
        { userId: 'id-1', id: 'id-1' },
      ],
    ] as any;
  }
});

describe('clearUserState', () => {
  it('resets layout', async () => {
    await expectSaga(clearUserState).put(receive([])).withReducer(rootReducer).run();
  });

  it('verifies state reset calls', async () => {
    await expectSaga(clearUserState)
      .call(clearChannelsAndConversations)
      .call(clearMessages)
      .call(clearUsers)
      .withReducer(rootReducer)
      .run();
  });
});

describe(logoutRequest, () => {
  it('prompts the user when they try to logout', async () => {
    const state = new StoreBuilder();

    const { storeState } = await expectSaga(logoutRequest).withReducer(rootReducer, state.build()).run();

    expect(storeState.authentication.displayLogoutModal).toEqual(true);
  });
});

describe(forceLogout, () => {
  function expectLogoutSaga() {
    return expectSaga(forceLogout).provide([
      [matchers.call.fn(updateConnector), null],
      [call(terminate), null],
    ]);
  }

  it('closes the logout modal', async () => {
    const state = new StoreBuilder().withOtherState({ authentication: { displayLogoutModal: true, user: {} } });

    const { storeState } = await expectLogoutSaga().withReducer(rootReducer, state.build()).run();

    expect(storeState.authentication.displayLogoutModal).toEqual(false);
  });

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
    const { returnValue } = await expectSaga(authenticateByEmail, email, password)
      .provide([
        stubResponse(call(emailLogin, { email, password }), { success: true, response: {} }),
        ...successResponses(),
      ])
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
