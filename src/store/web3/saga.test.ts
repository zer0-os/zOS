import { expectSaga } from 'redux-saga-test-plan';

import { getSignedToken, updateConnector } from './saga';
import { ConnectionStatus } from '../../lib/web3';
import { reducer } from '.';
import { call } from 'redux-saga/effects';
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
});
