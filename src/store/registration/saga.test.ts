import { expectSaga } from 'redux-saga-test-plan';

import { createAccount, updateProfile, validateInvite } from './saga';
import {
  validateInvite as apiValidateInvite,
  createAccount as apiCreateAccount,
  updateProfile as apiUpdateProfile,
} from './api';
import { call } from 'redux-saga/effects';
import { InviteCodeStatus, RegistrationStage, RegistrationState, initialState as initialRegistrationState } from '.';
import { rootReducer } from '../reducer';

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

// XXX: test error conditisons for both
// XXX: test the overall saga

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
          true,
        ],
      ])
      .withReducer(rootReducer, initialState({ inviteCode, stage: RegistrationStage.AccountCreation }))
      .run();
    expect(registration.stage).toEqual(RegistrationStage.ProfileDetails);
    expect(returnValue).toEqual(true);
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
          call(apiUpdateProfile, { name }),
          true,
        ],
      ])
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.ProfileDetails }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.Done);
    expect(returnValue).toEqual(true);
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
