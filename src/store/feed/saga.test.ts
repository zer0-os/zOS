import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { client } from '../../lib/web3/zns/client';
import { service as providerService } from '../../lib/web3/provider-service';

import { load } from './saga';
import { AsyncActionStatus, reducer } from '.';

describe('feed saga', () => {
  it('should pass current provider to zns client', async () => {
    const currentProvider = { networkId: 7 };

    await expectSaga(load)
      .provide([
        [matchers.call.fn(client.get), { getFeed: () => [] }],
        [matchers.call.fn(providerService.get), currentProvider],
      ])
      .call(client.get, currentProvider)
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

    const znsClient = {
      getFeed: () => items,
    };

    await expectSaga(load)
      .withReducer(reducer)
      .provide([
        [matchers.call.fn(client.get), znsClient],
      ])
      .hasFinalState({ value: items, status: AsyncActionStatus.Idle })
      .run();
  });
});
