import { expectSaga } from '../../test/saga';

import { emailLogin, redirectToRoot, validateEmailLogin, web3Login } from './saga';
import { getSignedToken } from '../web3/saga';
import { nonceOrAuthorize } from '../authentication/saga';

import { call } from 'redux-saga/effects';

import { EmailLoginErrors, Web3LoginErrors, initialState } from '.';

import { rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';
import { authenticateByEmail } from '../authentication/saga';
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
  it('redirects to root when web3 login successful', async () => {
    const connectorId = 'metamask';
    const signedToken = 'signed-token';

    await subject(web3Login, { payload: connectorId })
      .provide([
        [call(getSignedToken), { success: true, token: signedToken }],
        [call(nonceOrAuthorize, { payload: { signedWeb3Token: signedToken } }), { nonce: undefined }],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .call(redirectToRoot)
      .run();
  });

  it('sets error state if message signing fails', async () => {
    const connectorId = 'metamask';
    const error = 'some error';

    const { storeState } = await subject(web3Login, { payload: connectorId })
      .provide([
        [call(getSignedToken), { success: false, error }],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([error]);
  });

  it('sets error state if nonceOrAuthorize returns nonce', async () => {
    const connectorId = 'metamask';
    const signedToken = 'signed-token';

    const { storeState } = await subject(web3Login, { payload: connectorId })
      .provide([
        [call(getSignedToken), { success: true, token: signedToken }],
        [call(nonceOrAuthorize, { payload: { signedWeb3Token: signedToken } }), { nonce: '123' }],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([Web3LoginErrors.PROFILE_NOT_FOUND]);
  });

  it('sets error state if nonceOrAuthorize API call throws an exception', async () => {
    const connectorId = 'metamask';
    const signedToken = 'signed-token';

    const { storeState } = await subject(web3Login, { payload: connectorId })
      .provide([
        [call(getSignedToken), { success: true, token: signedToken }],
        [
          call(nonceOrAuthorize, { payload: { signedWeb3Token: signedToken } }),
          throwError(new Error('API call failed')),
        ],
      ])
      .withReducer(rootReducer, new StoreBuilder().build())
      .run();

    expect(storeState.login.errors).toEqual([EmailLoginErrors.UNKNOWN_ERROR]);
  });

  it('clears errors on success', async () => {
    const connectorId = 'metamask';
    const signedToken = 'signed-token';
    const state = new StoreBuilder().withOtherState({ login: { ...initialState, errors: ['existing_error'] } });

    const { storeState } = await subject(web3Login, { payload: connectorId })
      .provide([
        [call(getSignedToken), { success: true, token: signedToken }],
        [call(nonceOrAuthorize, { payload: { signedWeb3Token: signedToken } }), { nonce: null }],
        [call(redirectToRoot), undefined],
      ])
      .withReducer(rootReducer, state.build())
      .run();

    expect(storeState.login.errors).toEqual([]);
  });
});
