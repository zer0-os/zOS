import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import { updateConnector, setConnectionStatus } from './saga';
import { Connectors, ConnectionStatus } from '../../lib/web3';
import { reducer } from '.';
import { setConnectionStatus as appSandboxSetConnectionStatus} from '../../app-sandbox/store/web3';
import { dispatch } from '../../app-sandbox/store';

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

  it('should dispatch Connecting status to app sandbox', async () => {
    await expectSaga(updateConnector, { payload: Connectors.Metamask })
      .provide([ matchers.call.fn(dispatch) ])
      .call(dispatch, appSandboxSetConnectionStatus(ConnectionStatus.Connecting))
      .run();
  });

  it('sets connection status to Connected', async () => {
    const { storeState } = await expectSaga(setConnectionStatus, { payload: ConnectionStatus.Connected })
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      status: ConnectionStatus.Connected,
    });
  });

  it('should dispatch status to app sandbox', async () => {
    await expectSaga(setConnectionStatus, { payload: ConnectionStatus.Connected })
      .provide([ matchers.call.fn(dispatch) ])
      .call(dispatch, appSandboxSetConnectionStatus(ConnectionStatus.Connected))
      .run();
  });
});
