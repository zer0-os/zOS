import { expectSaga } from 'redux-saga-test-plan';

import { getSignedTokenForConnector, updateConnector, waitForAddressChange, waitForError } from './saga';
import { Connectors, ConnectionStatus, personalSignToken } from '../../lib/web3';
import { reducer } from '.';
import { call } from 'redux-saga/effects';
import { getService } from '../../lib/web3/provider-service';
import { RootState, rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';

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

describe(getSignedTokenForConnector, () => {
  it('connects and waits for an address change when connection is not already set up', async () => {
    const { returnValue } = await expectSaga(getSignedTokenForConnector, Connectors.Metamask)
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
      .withReducer(rootReducer, { web3: { value: { connector: Connectors.Infura, address: '' } } } as RootState)
      .run();

    expect(returnValue.success).toEqual(true);
    expect(returnValue.token).toEqual('0x9876');
  });

  it('connects when the connector has changed', async () => {
    const { returnValue } = await expectSaga(getSignedTokenForConnector, Connectors.Metamask)
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
      .withReducer(rootReducer, { web3: { value: { connector: Connectors.Infura, address: '0x1234' } } } as RootState)
      .call(waitForAddressChange)
      .run();

    expect(returnValue.success).toEqual(true);
    expect(returnValue.token).toEqual('0x9876');
  });

  it('does not try to connect again if an address/connector is already selected', async () => {
    const { returnValue } = await expectSaga(getSignedTokenForConnector, Connectors.Metamask)
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
      .withReducer(rootReducer, { web3: { value: { connector: Connectors.Metamask, address: '0x1234' } } } as RootState)
      .run();

    expect(returnValue.success).toEqual(true);
    expect(returnValue.token).toEqual('0x9876');
  });

  it('returns an error when connection error occurs', async () => {
    const { returnValue } = await expectSaga(getSignedTokenForConnector, Connectors.Metamask)
      .provide([
        [
          call(waitForError),
          'an-error-occurred',
        ],
      ])
      .withReducer(rootReducer, { web3: { value: { connector: Connectors.Infura, address: '' } } } as RootState)
      .run();

    expect(returnValue.success).toEqual(false);
    expect(returnValue.error).toEqual('an-error-occurred');
  });

  it('returns an error when signing error occurs', async () => {
    const { returnValue } = await expectSaga(getSignedTokenForConnector, Connectors.Metamask)
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
          throwError(new Error()),
        ],
      ])
      .withReducer(rootReducer, { web3: { value: { connector: Connectors.Infura, address: '' } } } as RootState)
      .run();

    expect(returnValue.success).toEqual(false);
    expect(returnValue.error).toEqual('Wallet connection failed. Please try again.');
  });
});
