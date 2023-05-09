import { expectSaga } from 'redux-saga-test-plan';

import { createAccount, updateProfile, validateAccountInfo, validateInvite } from './saga';
import {
  validateInvite as apiValidateInvite,
  createAccount as apiCreateAccount,
  completeAccount as apiCompleteAccount,
} from './api';
import { call } from 'redux-saga/effects';
import {
  AccountCreationErrors,
  InviteCodeStatus,
  ProfileDetailsErrors,
  RegistrationStage,
  RegistrationState,
  initialState as initialRegistrationState,
} from '.';
import { rootReducer } from '../reducer';
import { fetchCurrentUser } from '../authentication/api';
import { nonce as nonceApi } from '../authentication/api';
import { throwError } from 'redux-saga-test-plan/providers';

describe('validate invite', () => {
  it('validates invite code, returns true if VALID', async () => {
    const code = '123456';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(validateInvite, { payload: { code } })
      .provide([
        [
          call(apiValidateInvite, { code }),
          InviteCodeStatus.VALID,
        ],
      ])
      .withReducer(rootReducer, initialState())
      .run();

    expect(returnValue).toEqual(true);
    expect(registration.inviteCodeStatus).toEqual(InviteCodeStatus.VALID);
    expect(registration.inviteCode).toEqual(code);
    expect(registration.stage).toEqual(RegistrationStage.AccountCreation);
  });

  it('validates invite code, returns false if NOT VALID and stays on invite stage', async () => {
    const code = '654321';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(validateInvite, { payload: { code } })
      .provide([
        [
          call(apiValidateInvite, { code }),
          InviteCodeStatus.INVITE_CODE_USED,
        ],
      ])
      .withReducer(rootReducer, initialState())
      .run();

    expect(returnValue).toEqual(false);
    expect(registration.inviteCodeStatus).toEqual(InviteCodeStatus.INVITE_CODE_USED);
    expect(registration.stage).toEqual(RegistrationStage.ValidateInvite);
  });
});

const VALID_PASSWORD = 'aA1!aaaa';
describe('createAccount', () => {
  it('creates a new account with email and password', async () => {
    const email = 'john@example.com';
    const password = VALID_PASSWORD;
    const inviteCode = '123987';
    const nonceToken = 'abc123';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(nonceApi),
          { nonceToken },
        ],
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email, nonceToken }),
          { success: true, response: {} },
        ],
        [
          call(fetchCurrentUser),
          { id: '123' },
        ],
      ])
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.AccountCreation, inviteCode }))
      .run();
    expect(registration.stage).toEqual(RegistrationStage.ProfileDetails);
    expect(registration.userId).toEqual('123');
    expect(returnValue).toEqual(true);
  });

  it('sets error state if validation fails', async () => {
    const email = 'any';
    const password = 'any';
    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(validateAccountInfo, { email, password }),
          [AccountCreationErrors.EMAIL_REQUIRED],
        ],
      ])
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.AccountCreation }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.AccountCreation);
    expect(registration.errors).toEqual([AccountCreationErrors.EMAIL_REQUIRED]);
    expect(returnValue).toEqual(false);
  });

  it('sets error state from api call', async () => {
    const email = 'john@example.com';
    const password = VALID_PASSWORD;
    const inviteCode = '123987';
    const nonceToken = 'abc123';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(nonceApi),
          { nonceToken },
        ],
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email, nonceToken }),
          { success: false, response: 'EMAIL_INVALID' },
        ],
      ])
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.AccountCreation, inviteCode }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.AccountCreation);
    expect(registration.errors).toEqual(['EMAIL_INVALID']);
    expect(returnValue).toEqual(false);
  });

  it('sets error state if api call throws an exception', async () => {
    const email = 'john@example.com';
    const password = VALID_PASSWORD;
    const inviteCode = '123987';
    const nonceToken = 'abc123';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(nonceApi),
          { nonceToken },
        ],
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email, nonceToken }),
          throwError(new Error('Stub api error')),
        ],
      ])
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.AccountCreation, inviteCode }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.AccountCreation);
    expect(registration.errors).toEqual([AccountCreationErrors.UNKNOWN_ERROR]);
    expect(returnValue).toEqual(false);
  });

  it('sets error state if fetching the new user fails', async () => {
    const email = 'john@example.com';
    const password = VALID_PASSWORD;
    const inviteCode = '123987';
    const nonceToken = 'abc123';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(nonceApi),
          { nonceToken },
        ],
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email, nonceToken }),
          { success: true, response: {} },
        ],
        [
          call(fetchCurrentUser),
          false,
        ],
      ])
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.AccountCreation, inviteCode }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.AccountCreation);
    expect(registration.errors).toEqual([AccountCreationErrors.UNKNOWN_ERROR]);
    expect(returnValue).toEqual(false);
  });

  it('clears errors on success', async () => {
    const email = 'john@example.com';
    const password = VALID_PASSWORD;
    const inviteCode = '123987';
    const nonceToken = 'abc123';

    const {
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(nonceApi),
          { nonceToken },
        ],
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email, nonceToken }),
          { success: true, response: {} },
        ],
        [
          call(fetchCurrentUser),
          { id: '123' },
        ],
      ])
      .withReducer(
        rootReducer,
        initialState({ errors: ['existing_error'], stage: RegistrationStage.AccountCreation, inviteCode })
      )
      .run();

    expect(registration.errors).toEqual([]);
  });
});

describe('updateProfile', () => {
  it('updates the users profile information', async () => {
    const name = 'john';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(updateProfile, { payload: { name } })
      .provide([
        [
          call(apiCompleteAccount, { userId: 'abc', name, inviteCode: 'INV123' }),
          { success: true },
        ],
      ])
      .withReducer(
        rootReducer,
        initialState({ userId: 'abc', inviteCode: 'INV123', stage: RegistrationStage.ProfileDetails })
      )
      .run();

    expect(registration.stage).toEqual(RegistrationStage.Done);
    expect(returnValue).toEqual(true);
  });

  it('sets error state if updating the profile fails', async () => {
    const name = 'john';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(updateProfile, { payload: { name } })
      .provide([
        [
          call(apiCompleteAccount, { userId: 'abc', name, inviteCode: 'INV123' }),
          throwError(new Error('Stub api error')),
        ],
      ])
      .withReducer(
        rootReducer,
        initialState({ userId: 'abc', inviteCode: 'INV123', stage: RegistrationStage.ProfileDetails })
      )
      .run();

    expect(registration.stage).toEqual(RegistrationStage.ProfileDetails);
    expect(registration.errors).toEqual([ProfileDetailsErrors.UNKNOWN_ERROR]);
    expect(returnValue).toEqual(false);
  });

  it('validates data', async () => {
    const name = '';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(updateProfile, { payload: { name } })
      .withReducer(rootReducer, initialState({ userId: 'abc', stage: RegistrationStage.ProfileDetails }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.ProfileDetails);
    expect(registration.errors).toEqual([
      ProfileDetailsErrors.NAME_REQUIRED,
    ]);
    expect(returnValue).toEqual(false);
  });
});

describe('validateAccountInfo', () => {
  it('ensures email exists', async () => {
    const email = '';
    const password = 'aA1!aaaa';

    const errors = validateAccountInfo({ email, password });

    expect(errors).toEqual([AccountCreationErrors.EMAIL_REQUIRED]);
  });

  it('ensures password exists', async () => {
    const email = 'blah';
    const password = '';

    const errors = validateAccountInfo({ email, password });

    expect(errors).toEqual([AccountCreationErrors.PASSWORD_REQUIRED]);
  });

  it('ensures password is strong enough', async () => {
    const email = 'blah';
    const password = 'aabbccdd';

    const errors = validateAccountInfo({ email, password });

    expect(errors).toEqual([AccountCreationErrors.PASSWORD_TOO_WEAK]);
  });
});

function initialState(attrs: Partial<RegistrationState> = {}) {
  return {
    registration: {
      ...initialRegistrationState,
      ...attrs,
    },
  } as any;
}
