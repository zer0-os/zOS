import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { connect } from './saga';

import { client } from '../../lib/channels';

import { ConnectionStatus, reducer, setStatus } from '.';

describe('channels saga', () => {
  const getClient = (overrides = {}) => {
    return {
      connect: async () => false,
      ...overrides,
    };
  };

  it('sets status to connecting', async () => {
    await expectSaga(connect, { payload: '0x000000000000000000000000000000000000000A' })
      .provide([
        [matchers.call.fn(client.get), getClient()],
      ])
      .put(setStatus(ConnectionStatus.Connecting))
      .run();
  });

  it('connects to client for account', async () => {
    const channelsClient = getClient();

    const account = '0x000000000000000000000000000000000000000A';

    await expectSaga(connect, { payload: account })
      .provide([
        [matchers.call.fn(client.get), channelsClient],
        [matchers.call([channelsClient, channelsClient.connect], account), true],
      ])
      .call([channelsClient, channelsClient.connect], account)
      .run();
  });
});
