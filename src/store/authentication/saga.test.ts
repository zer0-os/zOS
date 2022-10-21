import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { authorize, clearSession, getCurrentUser } from './saga';
import { authorize as authorizeApi, fetchCurrentUser, clearSession as clearSessionApi } from './api';

import { reducer } from '.';

const authorizationResponse = {
  accessToken: 'eyJh-access-token',
};

const currentUserResponse = {
  userId: 'id-1',
};

describe('authentication saga', () => {
  const signedWeb3Token = '0x000000000000000000000000000000000000000A';
  it('authorize', async () => {
    await expectSaga(authorize, { payload: { signedWeb3Token } })
      .provide([
        [
          matchers.call.fn(authorizeApi),
          authorizationResponse,
        ],
        [
          matchers.call.fn(fetchCurrentUser),
          currentUserResponse,
        ],
      ])
      .call(authorizeApi, signedWeb3Token)
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
