import { expectSaga } from '../../test/saga';

import { emailLogin, redirectToRoot, validateEmailLogin, web3Login } from './saga';
import { authenticateByEmail, completeUserLogin } from '../authentication/saga';
import { getChallenge, authorizeSIWE } from '../authentication/api';
import { signSIWEMessage } from '../../lib/web3';
import { getWagmiConfig } from '../../lib/web3/wagmi-config';
import { getWalletClient } from '@wagmi/core';

import { call } from 'redux-saga/effects';

import { EmailLoginErrors, Web3LoginErrors, initialState } from '.';

import { rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';
import { StoreBuilder } from '../test/store';

function subject(...args: Parameters<typeof expectSaga>) {
  return expectSaga(...args).provide([[call(redirectToRoot), undefined]]);
}

describe(emailLogin, () => {
  it('redirects to root when login successful', async () => {
    const email = 'any email';
    const password = 'any password';

    await subject(emailLogin, { payload: { email, password } })
      .provide([[call(authenticateByEmail, email, password), { success: true, response: {} }]])
      .withReducer(rootReducer, new StoreBuilder().build())
      .call(redirectToRoot)
      .run();
  });

  it('sets error state if validation fails', async () => {
    const email = 'any email';
    const password = 'any password';

    const { storeState } = await subject(emailLogin, { payload: { email, password } })
      .provide([[call(validateEmailLogin, { email, password }), [EmailLoginErrors.EMAIL_REQUIRED]]])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([EmailLoginErrors.EMAIL_REQUIRED]);
  });

  it('sets error state if login fails', async () => {
    const email = 'any email';
    const password = 'any password';

    const { storeState } = await subject(emailLogin, { payload: { email, password } })
      .provide([
        [call(authenticateByEmail, email, password), { success: false, response: EmailLoginErrors.UNKNOWN_ERROR }],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([EmailLoginErrors.UNKNOWN_ERROR]);
  });

  it('sets error state if api call throws an exception', async () => {
    const email = 'any email';
    const password = 'any password';

    const { storeState } = await subject(emailLogin, { payload: { email, password } })
      .provide([[call(authenticateByEmail, email, password), throwError(new Error('Stub api error'))]])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([EmailLoginErrors.UNKNOWN_ERROR]);
  });

  it('clears errors on success', async () => {
    const email = 'any email';
    const password = 'any password';
    const state = new StoreBuilder().withOtherState({ login: { ...initialState, errors: ['existing_error'] } });

    const { storeState } = await subject(emailLogin, { payload: { email, password } })
      .provide([[call(authenticateByEmail, email, password), { success: true, response: {} }]])
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.login.errors).toEqual([]);
  });
});

describe(validateEmailLogin, () => {
  it('ensures email exists', async () => {
    const email = '';
    const password = 'aA1!aaaa';

    const errors = validateEmailLogin({ email, password });

    expect(errors).toEqual([EmailLoginErrors.EMAIL_REQUIRED]);
  });

  it('ensures password exists', async () => {
    const email = 'blah';
    const password = '';

    const errors = validateEmailLogin({ email, password });

    expect(errors).toEqual([EmailLoginErrors.PASSWORD_REQUIRED]);
  });
});

describe(web3Login, () => {
  const mockWagmiConfig = {} as any;
  const mockWalletClient = {
    account: { address: '0x123' as `0x${string}` },
  } as any;
  const mockChallenge = { message: 'test message', nonce: 'test-nonce' };
  const mockSignature = '0xsignature' as `0x${string}`;

  it('redirects to root when web3 login successful', async () => {
    await subject(web3Login)
      .provide([
        [call(getWagmiConfig), mockWagmiConfig],
        [call(getWalletClient, mockWagmiConfig), mockWalletClient],
        [call(getChallenge, '0x123', 'localhost'), mockChallenge],
        [call(signSIWEMessage, mockWalletClient, '0x123', mockChallenge.message), mockSignature],
        [call(authorizeSIWE, mockChallenge.message, mockSignature), { accessToken: 'token' }],
        [call(completeUserLogin), undefined],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .call(redirectToRoot)
      .run();
  });

  it('sets error state if wallet client is not available', async () => {
    const { storeState } = await subject(web3Login)
      .provide([
        [call(getWagmiConfig), mockWagmiConfig],
        [call(getWalletClient, mockWagmiConfig), null],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([Web3LoginErrors.UNKNOWN_ERROR]);
  });

  it('sets error state if message signing fails', async () => {
    const { storeState } = await subject(web3Login)
      .provide([
        [call(getWagmiConfig), mockWagmiConfig],
        [call(getWalletClient, mockWagmiConfig), mockWalletClient],
        [call(getChallenge, '0x123', 'localhost'), mockChallenge],
        [
          call(signSIWEMessage, mockWalletClient, '0x123', mockChallenge.message),
          throwError(new Error('Signing failed')),
        ],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([Web3LoginErrors.UNKNOWN_ERROR]);
  });

  it('sets error state if authorizeSIWE returns no accessToken', async () => {
    const { storeState } = await subject(web3Login)
      .provide([
        [call(getWagmiConfig), mockWagmiConfig],
        [call(getWalletClient, mockWagmiConfig), mockWalletClient],
        [call(getChallenge, '0x123', 'localhost'), mockChallenge],
        [call(signSIWEMessage, mockWalletClient, '0x123', mockChallenge.message), mockSignature],
        [call(authorizeSIWE, mockChallenge.message, mockSignature), {}],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([Web3LoginErrors.PROFILE_NOT_FOUND]);
  });

  it('sets error state if authorizeSIWE throws PUBLIC_ADDRESS_NOT_FOUND', async () => {
    const error = new Error('Not found') as any;
    error.response = { body: { code: 'PUBLIC_ADDRESS_NOT_FOUND' } };

    const { storeState } = await subject(web3Login)
      .provide([
        [call(getWagmiConfig), mockWagmiConfig],
        [call(getWalletClient, mockWagmiConfig), mockWalletClient],
        [call(getChallenge, '0x123', 'localhost'), mockChallenge],
        [call(signSIWEMessage, mockWalletClient, '0x123', mockChallenge.message), mockSignature],
        [call(authorizeSIWE, mockChallenge.message, mockSignature), throwError(error)],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([Web3LoginErrors.PROFILE_NOT_FOUND]);
  });

  it('sets error state if API call throws an exception', async () => {
    const { storeState } = await subject(web3Login)
      .provide([
        [call(getWagmiConfig), mockWagmiConfig],
        [call(getWalletClient, mockWagmiConfig), mockWalletClient],
        [call(getChallenge, '0x123', 'localhost'), throwError(new Error('API call failed'))],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([Web3LoginErrors.UNKNOWN_ERROR]);
  });

  it('clears errors on success', async () => {
    const state = new StoreBuilder().withOtherState({ login: { ...initialState, errors: ['existing_error'] } });

    const { storeState } = await subject(web3Login)
      .provide([
        [call(getWagmiConfig), mockWagmiConfig],
        [call(getWalletClient, mockWagmiConfig), mockWalletClient],
        [call(getChallenge, '0x123', 'localhost'), mockChallenge],
        [call(signSIWEMessage, mockWalletClient, '0x123', mockChallenge.message), mockSignature],
        [call(authorizeSIWE, mockChallenge.message, mockSignature), { accessToken: 'token' }],
        [call(completeUserLogin), undefined],
      ])
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.login.errors).toEqual([]);
  });
});
