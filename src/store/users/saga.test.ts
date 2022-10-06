import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetch } from './saga';
import { searchMyNetworks } from './api';

import { reducer } from '.';

describe('Users saga', () => {
  const usersResponse = [
    {
      id: 'ce60cf6c-baff-424c-9f5a-058d2ee023c4',
      type: 'person',
      name: 'name test',
      summary: 'Runner, software developer',
      profileImage: 'https://s.gravatar.com/avatar.png',
      handle: null,
      rank: 0.66871976852417,
    },
    {
      id: '1c879bc2-d6c9-4f5e-9ffa-bc1019eb88b8',
      type: 'person',
      name: 'name test 2',
      summary: null,
      profileImage: 'https://s.gravatar.com/avatar.png',
      handle: null,
      rank: 0.607927083969116,
    },
  ];
  const search = 'na';

  it('fetch users', async () => {
    await expectSaga(fetch, { payload: { search } })
      .provide([
        [
          matchers.call.fn(searchMyNetworks),
          usersResponse,
        ],
      ])
      .call(searchMyNetworks, search)
      .run();
  });

  it('should store users', async () => {
    const { storeState } = await expectSaga(fetch, { payload: { search } })
      .provide([
        [
          matchers.call.fn(searchMyNetworks),
          usersResponse,
        ],
      ])
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      users: usersResponse,
    });
  });
});
