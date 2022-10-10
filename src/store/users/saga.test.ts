import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { fetch } from './saga';
import { searchMyNetworks } from './api';

import { reducer } from '.';
import { channelIdPrefix } from '../channels-list/saga';

describe('Users saga', () => {
  const usersResponse = [
    {
      userId: 'ce60cf6c-baff-424c-9f5a-058d2ee023c4',
      firstName: 'test',
      isOnline: false,
      lastName: 'name',
      lastSeenAt: '2022-10-07T16:29:22.800Z',
      profileId: '2c085571-7c37-489f-a30a-94cf25c210d3',
      profileImage: 'https://lh3.googleusercontent.com/a-/aaa',
    },
    {
      userId: 'ce60cf6c-baff-424c-9f5a-058d2ee023c4',
      firstName: 'test2',
      isOnline: false,
      lastName: 'name2',
      lastSeenAt: '2022-10-07T16:29:22.800Z',
      profileId: '2c085571-7c37-489f-a30a-94cf25c210d3',
      profileImage: 'https://lh3.googleusercontent.com/a-/bbb',
    },
  ];
  const channelId = '0x000000000000000000000000000000000000000A';

  it('fetch users', async () => {
    await expectSaga(fetch, { payload: { channelId } })
      .provide([
        [
          matchers.call.fn(searchMyNetworks),
          usersResponse,
        ],
      ])
      .call(searchMyNetworks, channelIdPrefix + channelId)
      .run();
  });

  it('should store users', async () => {
    const { storeState } = await expectSaga(fetch, { payload: { channelId } })
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
