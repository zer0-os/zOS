import { expectSaga } from '../../test/saga';

import { emailLogin, redirectToRoot, validateEmailLogin } from './saga';

import { call } from 'redux-saga/effects';

import { EmailLoginErrors, initialState } from '.';

import { rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';
import { authenticateByEmail } from '../authentication/saga';
import { StoreBuilder } from '../test/store';

describe(emailLogin, () => {
  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([[call(redirectToRoot), undefined]]);
  }

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
