import { expectSaga } from 'redux-saga-test-plan';

import { getSignedToken, updateConnector, waitForAddressChange } from './saga';
import { Connectors, ConnectionStatus, personalSignToken } from '../../lib/web3';
import { Web3State, reducer } from '.';
import { call } from 'redux-saga/effects';
import { getService } from '../../lib/web3/provider-service';
import { RootState, rootReducer } from '../reducer';

describe('web3 saga', () => {
  it('sets new connector and status to Connecting', async () => {
    const { storeState } = await expectSaga(updateConnector, {
      payload: Connectors.Metamask,
    })
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

describe('getSignedToken', () => {
  it('connects and waits for an address change when connection is not already set up', async () => {
    const { returnValue } = await expectSaga(getSignedToken, Connectors.Metamask)
      .provide([
        [
          call(waitForAddressChange),
          '0x1234',
        ],
        [
          call(getService),
          { get: () => ({ provider: 'stub' }) },
        ],
        [
          call(personalSignToken, { provider: 'stub' }, '0x1234'),
          '0x9876',
        ],
      ])
      .withReducer(rootReducer)
      .run();

    expect(returnValue).toEqual('0x9876');
  });

  it('does not try to connect again if an address is already selected', async () => {
    const { returnValue } = await expectSaga(getSignedToken, Connectors.Metamask)
      .provide([
        [
          call(getService),
          { get: () => ({ provider: 'stub' }) },
        ],
        [
          call(personalSignToken, { provider: 'stub' }, '0x1234'),
          '0x9876',
        ],
      ])
      .withReducer(rootReducer, { web3: { value: { address: '0x1234' } } } as RootState)
      .run();

    expect(returnValue).toEqual('0x9876');
  });
});
