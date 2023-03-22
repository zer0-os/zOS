import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { setUser } from '.';
import { nonceOrAuthorize, clearSession, getCurrentUser } from './saga';
import { nonceOrAuthorize as nonceOrAuthorizeApi, fetchCurrentUser, clearSession as clearSessionApi } from './api';

import { reducer } from '.';
import { setChatAccessToken } from '../chat';

const authorizationResponse = {
  accessToken: 'eyJh-access-token',
  chatAccessToken: 'chat-access-token',
};

const nonceResponse = {
  nonceToken: 'expiring-nonce-token',
};

const currentUserResponse = {
  userId: 'id-1',
};

describe('authentication saga', () => {
  const signedWeb3Token = '0x000000000000000000000000000000000000000A';

  it('nonceOrAuthorize with accessToken', async () => {
    await expectSaga(nonceOrAuthorize, { payload: { signedWeb3Token } })
      .provide([
        [
          matchers.call.fn(nonceOrAuthorizeApi),
          authorizationResponse,
        ],
        [
          matchers.call.fn(fetchCurrentUser),
          currentUserResponse,
        ],
      ])
      .call(nonceOrAuthorizeApi, signedWeb3Token)
      .call(getCurrentUser)
      .put(setChatAccessToken({ value: authorizationResponse.chatAccessToken, isLoading: false }))
      .run();
  });

  it('nonceOrAuthorize with nonceToken', async () => {
    await expectSaga(nonceOrAuthorize, { payload: { signedWeb3Token } })
      .provide([
        [
          matchers.call.fn(nonceOrAuthorizeApi),
          nonceResponse,
        ],
      ])
      .call(nonceOrAuthorizeApi, signedWeb3Token)
      .put(setUser({ nonce: nonceResponse.nonceToken }))
      .run();
  });

  it('getCurrentUser', async () => {
    await expectSaga(getCurrentUser)
      .provide([
        [
          matchers.call.fn(fetchCurrentUser),
          currentUserResponse,
        ],
      ])
      .call(fetchCurrentUser)
      .run();
  });

  it('clearSession', async () => {
    await expectSaga(clearSession)
      .provide([
        [
          matchers.call.fn(clearSessionApi),
          true,
        ],
      ])
      .call(clearSessionApi)
      .put(setUser({ data: null, isLoading: false, nonce: null }))
      .put(setChatAccessToken({ value: null, isLoading: false }))
      .run();
  });

  it('should store user', async () => {
    const { storeState } = await expectSaga(getCurrentUser)
      .provide([
        [
          matchers.call.fn(fetchCurrentUser),
          currentUserResponse,
        ],
      ])
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      user: {
        data: currentUserResponse,
        isLoading: false,
      },
    });
  });
});
