import { expectSaga } from 'redux-saga-test-plan';

import { updateConnector } from './saga';
import { Connectors, ConnectionStatus } from '../../lib/web3';
import { reducer } from '.';

describe('web3 saga', () => {
  it('sets new connector and status to Connecting', async () => {
    const { storeState } = await expectSaga(updateConnector, { payload: Connectors.Metamask })
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      status: ConnectionStatus.Connecting,
      value: {
        connector: Connectors.Metamask,
      },
    });
  });
});
