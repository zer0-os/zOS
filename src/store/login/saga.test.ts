import { expectSaga } from 'redux-saga-test-plan';

import { emailLogin, openFirstConversation, validateEmailLogin } from './saga';

import { call } from 'redux-saga/effects';

import { EmailLoginErrors, LoginStage, LoginState, initialState as initialRegistrationState } from '.';

import { rootReducer } from '../reducer';
import { throwError } from 'redux-saga-test-plan/providers';
import { setactiveConversationId } from '../chat';
import { authenticateByEmail } from '../authentication/saga';
import { StoreBuilder } from '../test/store';

describe('emailLogin', () => {
  it('logs the user in', async () => {
    const email = 'any email';
    const password = 'any password';

    const {
      returnValue,
      storeState: { login },
    } = await expectSaga(emailLogin, { payload: { email, password } })
      .provide([
        [
          call(authenticateByEmail, email, password),
          { success: true, response: {} },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .run();

    expect(returnValue).toEqual(true);
    expect(login.stage).toEqual(LoginStage.Done);
  });

  it('sets error state if validation fails', async () => {
    const email = 'any email';
    const password = 'any password';

    const {
      returnValue,
      storeState: { login },
    } = await expectSaga(emailLogin, { payload: { email, password } })
      .provide([
        [
          call(validateEmailLogin, { email, password }),
          [EmailLoginErrors.EMAIL_REQUIRED],
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .run();

    expect(login.errors).toEqual([EmailLoginErrors.EMAIL_REQUIRED]);
    expect(returnValue).toEqual(false);
  });

  it('sets error state if login fails', async () => {
    const email = 'any email';
    const password = 'any password';

    const {
      returnValue,
      storeState: { login },
    } = await expectSaga(emailLogin, { payload: { email, password } })
      .provide([
        [
          call(authenticateByEmail, email, password),
          { success: false, response: EmailLoginErrors.UNKNOWN_ERROR },
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .run();

    expect(login.errors).toEqual([EmailLoginErrors.UNKNOWN_ERROR]);
    expect(returnValue).toEqual(false);
  });

  it('sets error state if api call throws an exception', async () => {
    const email = 'any email';
    const password = 'any password';

    const {
      returnValue,
      storeState: { login },
    } = await expectSaga(emailLogin, { payload: { email, password } })
      .provide([
        [
          call(authenticateByEmail, email, password),
          throwError(new Error('Stub api error')),
        ],
      ])
      .withReducer(rootReducer, initialState({}))
      .run();

    expect(login.errors).toEqual([EmailLoginErrors.UNKNOWN_ERROR]);
    expect(returnValue).toEqual(false);
  });

  it('clears errors on success', async () => {
    const email = 'any email';
    const password = 'any password';

    const {
      storeState: { login },
    } = await expectSaga(emailLogin, { payload: { email, password } })
      .provide([
        [
          call(authenticateByEmail, email, password),
          { success: true, response: {} },
        ],
      ])
      .withReducer(rootReducer, initialState({ errors: ['existing_error'] }))
      .run();

    expect(login.errors).toEqual([]);
  });
});

describe('validateEmailLogin', () => {
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

describe(openFirstConversation, () => {
  it('opens the first conversation', async () => {
    const initialState = new StoreBuilder().withConversationList({ id: '1234' });

    await expectSaga(openFirstConversation)
      .withReducer(rootReducer, initialState.build())
      .put(setactiveConversationId('1234'))
      .run();
  });
});

function initialState(attrs: Partial<LoginState> = {}) {
  return {
    login: {
      ...initialRegistrationState,
      ...attrs,
    },
  } as any;
}
