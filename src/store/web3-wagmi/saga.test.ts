import { expectSaga } from 'redux-saga-test-plan';

import { getSignedToken, getSignedTokenForConnector, updateConnector, waitForAddressChange } from './saga';
import { ConnectionStatus } from '../../lib/web3';
import { reducer } from '.';
import { call } from 'redux-saga/effects';
import { RootState, rootReducer } from '../reducer';
import { getWagmiConfig, wagmiConfig } from '../../lib/web3/wagmi-config';
import { getWalletClient } from '@wagmi/core';

describe('web3 saga', () => {
  it('sets new connector and status to Connecting', async () => {
    const { storeState } = await expectSaga(updateConnector, {
      payload: 'metamask',
    })
      .withReducer(reducer)
      .run();

    expect(storeState).toMatchObject({
      status: ConnectionStatus.Connecting,
      value: {
        connectorId: 'metamask',
      },
    });
  });
});

describe(getSignedTokenForConnector, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([[call(getSignedToken), undefined]]);
  }

  it('connects and waits for an address change when connection is not already set up', async () => {
    const { returnValue } = await subject(getSignedTokenForConnector, 'metamask')
      .provide([
        [
          call(waitForAddressChange),
          '0x1234',
        ],
        [
          call(getSignedToken, '0x1234'),
          { success: true, token: '0x9876' },
        ],
      ])
      .withReducer(rootReducer, { web3Wagmi: { value: { connectorId: 'infura', address: '' } } } as RootState)
      .run();

    expect(returnValue.success).toEqual(true);
    expect(returnValue.token).toEqual('0x9876');
  });
});

describe(getSignedToken, () => {
  it('successfully gets signed token using viem wallet client', async () => {
    const { returnValue } = await expectSaga(getSignedToken, '0x1234')
      .provide([
        [call(getWagmiConfig), wagmiConfig],
        [call(getWalletClient, wagmiConfig), { signMessage: jest.fn().mockResolvedValue('0x1234') } as any],
      ])
      .withReducer(reducer)
      .run();

    expect(returnValue).toEqual({ success: true, token: '0x1234' });
  });

  it('returns an error if token signature fails', () => {
    return expectSaga(getSignedToken, '0x1234')
      .provide([
        [call(getWagmiConfig), wagmiConfig],
        [
          call(getWalletClient, wagmiConfig),
          // The actual error message does not matter
          { signMessage: jest.fn().mockRejectedValue(new Error('Mock error')) } as any,
        ],
      ])
      .run()
      .then(({ returnValue }) => {
        expect(returnValue).toEqual({ success: false, error: 'Wallet connection failed. Please try again.' });
      });
  });

  it('sets connector to undefined if wallet signature fails', () => {
    return expectSaga(getSignedToken, undefined)
      .provide([
        [call(getWagmiConfig), wagmiConfig],
        [
          call(getWalletClient, wagmiConfig),
          { signMessage: jest.fn().mockRejectedValue(new Error('Mock error')) } as any,
        ],
      ])
      .withReducer(rootReducer, {
        web3Wagmi: {
          // @ts-ignore
          value: { connectorId: 'metamask', address: '0x1234' },
        },
      })
      .run()
      .then(({ storeState }) => {
        expect(storeState.web3Wagmi).toMatchObject({
          value: {
            connectorId: undefined,
          },
        });
      });
  });
});
