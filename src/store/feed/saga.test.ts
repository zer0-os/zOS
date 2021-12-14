import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { client } from '../../lib/web3/zns/client';
import { service as providerService } from '../../lib/web3/provider-service';

import { load } from './saga';
import { AsyncActionStatus, reducer } from '.';

describe('feed saga', () => {
  const getZnsClient = (overrides = {}) => {
    return {
      getFeed: async () => [],
      resolveIdFromName: () => '',
      ...overrides,
    };
  };

  it('should pass current provider to zns client', async () => {
    const currentProvider = { networkId: 7 };

    await expectSaga(load, { payload: '' })
      .provide([
        [matchers.call.fn(client.get), getZnsClient()],
        [matchers.call.fn(providerService.get), currentProvider],
      ])
      .call(client.get, currentProvider)
      .run();
  });

  it('should get feed for provided payload', async () => {
    const znsClient = getZnsClient();

    await expectSaga(load, { payload: 'theroute' })
      .provide([
        [matchers.call.fn(providerService.get), {}],
        [matchers.call.fn(client.get), znsClient],
        [matchers.call([znsClient, znsClient.resolveIdFromName], 'theroute'), 'the-id'],
        [matchers.call.fn(znsClient.getFeed), []],
      ])
      .call([znsClient, znsClient.getFeed], 'the-id')
      .run();
  });

  it('should set feed data in store from zns client', async () => {
    const items = [{
      id: 'the-first-id',
      title: 'The First ZNS Feed Item',
      description: 'This is the description of the first item.',
    }, {
      id: 'the-second-id',
      title: 'The Second ZNS Feed Item',
      description: 'This is the description of the Second item.',
    }, {
      id: 'the-third-id',
      title: 'The Third ZNS Feed Item',
      description: 'This is the description of the Third item.',
    }, {
      id: 'the-fourth-id',
      title: 'The Fourth ZNS Feed Item',
      description: 'This is the description of the Fourth item.',
    }];

    const znsClient = getZnsClient({
      getFeed: async () => items,
    });

    await expectSaga(load, { payload: '' })
      .withReducer(reducer)
      .provide([
        [matchers.call.fn(client.get), znsClient],
      ])
      .hasFinalState({ value: items, status: AsyncActionStatus.Idle })
      .run();
  });
});
