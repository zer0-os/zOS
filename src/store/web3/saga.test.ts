import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { updateConnector } from './saga';
import { Connectors, ConnectionStatus } from '../../lib/web3';
import { reducer } from '.';
import { setConnectionStatus } from '../../app-sandbox/store/web3';
import { dispatch } from '../../app-sandbox/store';

describe('web3 saga', () => {
  it('should set new connector and status to Connecting', async () => {
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

  it('should dispatch Connecting status to app sandbox', async () => {
    await expectSaga(updateConnector, { payload: Connectors.Metamask })
      .provide([ matchers.call.fn(dispatch) ])
      .call(dispatch, setConnectionStatus(ConnectionStatus.Connecting))
      .withReducer(reducer)
      .run();
  });
});
