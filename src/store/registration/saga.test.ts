import { expectSaga } from 'redux-saga-test-plan';

import { createAccount, updateProfile, validateInvite } from './saga';
import {
  validateInvite as apiValidateInvite,
  createAccount as apiCreateAccount,
  updateProfile as apiUpdateProfile,
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
import { throwError } from 'redux-saga-test-plan/providers';

describe('validate invite', () => {
  it('valites invite code, returns true if VALID', async () => {
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
    expect(registration.stage).toEqual(RegistrationStage.Done); // replace assertion with the next state
  });

  it('valites invite code, returns false if NOT VALID and stays on invite stage', async () => {
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

describe('createAccount', () => {
  it('creates a new account with email and password', async () => {
    const email = 'john@example.com';
    const password = 'funnyPassword';
    const inviteCode = '123987';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email }),
          { success: true, response: {} },
        ],
        [
          call(fetchCurrentUser),
          { profileSummary: { id: '123' } },
        ],
      ])
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.AccountCreation, inviteCode }))
      .run();
    expect(registration.stage).toEqual(RegistrationStage.ProfileDetails);
    expect(registration.profileId).toEqual('123');
    expect(returnValue).toEqual(true);
  });

  it('ensures data exists', async () => {
    const email = '';
    const password = '';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.AccountCreation }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.AccountCreation);
    expect(registration.errors).toEqual([
      AccountCreationErrors.EMAIL_REQUIRED,
      AccountCreationErrors.PASSWORD_REQUIRED,
    ]);
    expect(returnValue).toEqual(false);
  });

  it('sets error state from api call', async () => {
    const email = 'john@example.com';
    const password = 'funnyPassword';
    const inviteCode = '123987';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email }),
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
    const password = 'funnyPassword';
    const inviteCode = '123987';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email }),
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
    const password = 'funnyPassword';
    const inviteCode = '123987';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email }),
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
    const password = 'funnyPassword';
    const inviteCode = '123987';

    const {
      storeState: { registration },
    } = await expectSaga(createAccount, { payload: { email, password } })
      .provide([
        [
          call(apiCreateAccount, { email, password, inviteCode, handle: email }),
          { success: true, response: {} },
        ],
        [
          call(fetchCurrentUser),
          { profileSummary: { id: '123' } },
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
          call(apiUpdateProfile, { id: 'abc', firstName: name }),
          true,
        ],
      ])
      .withReducer(rootReducer, initialState({ profileId: 'abc', stage: RegistrationStage.ProfileDetails }))
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
          call(apiUpdateProfile, { id: 'abc', firstName: name }),
          throwError(new Error('Stub api error')),
        ],
      ])
      .withReducer(rootReducer, initialState({ profileId: 'abc', stage: RegistrationStage.ProfileDetails }))
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
      .withReducer(rootReducer, initialState({ profileId: 'abc', stage: RegistrationStage.ProfileDetails }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.ProfileDetails);
    expect(registration.errors).toEqual([
      ProfileDetailsErrors.NAME_REQUIRED,
    ]);
    expect(returnValue).toEqual(false);
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
