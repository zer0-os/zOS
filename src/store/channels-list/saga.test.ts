import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { api } from './api';
import { fetch } from './saga';

import { Status, setStatus } from '.';

describe('channels list saga', () => {
  it('sets status to fetching', async () => {
    await expectSaga(fetch, { payload: '0x000000000000000000000000000000000000000A' })
      .put(setStatus(Status.Fetching))
      .run();
  });

  it('fetches channels', async () => {
    const id = '0x000000000000000000000000000000000000000A';

    await expectSaga(fetch, { payload: id })
      .provide([
        [
          matchers.call.fn(api.fetch),
          [],
        ],
      ])
      .call(api.fetch, id)
      .run();
  });
});
