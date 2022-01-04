import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { client } from '../../lib/web3/zns/client';
import { service as providerService } from '../../lib/web3/provider-service';

import { updateConnector } from './saga';
import { Connectors, ConnectionStatus } from '../../lib/web3';
import { reducer } from '.';

describe('web3 saga', () => {
  it('should set new connector and status to Connecting', async () => {
    await expectSaga(updateConnector, { payload: Connectors.Metamask })
      .withReducer(reducer)
      .hasFinalState({
        status: ConnectionStatus.Connecting,
        value: {
          connector: Connectors.Metamask,
        },
      })
      .run();
  });
});
