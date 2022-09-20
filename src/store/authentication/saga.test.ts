import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { authorize } from './saga';
import { authorize as authorizeApi } from './api';

import { reducer } from '.';

const response = {
  accessToken: 'eyJh-access-token',
};

describe('authentication saga', () => {
  const signedWeb3Token = '0x000000000000000000000000000000000000000A';
  it('authorize', async () => {
    await expectSaga(authorize, { payload: { signedWeb3Token } })
      .provide([
        [
          matchers.call.fn(authorizeApi),
          response,
        ],
      ])
      .call(authorizeApi, signedWeb3Token)
      .run();
  });

  it('should store accessToken', async () => {
    const { storeState } = await expectSaga(authorize, {
      payload: { signedWeb3Token },
    })
      .provide([
        [
          matchers.call.fn(authorizeApi),
          response,
        ],
      ])
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      accessToken: response.accessToken,
    });
  });
});
