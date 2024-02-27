import { expectSaga } from '../../test/saga';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  authorizeAndCreateWeb3Account,
  clearRegistrationStateOnLogout,
  createAccount,
  createWelcomeConversation,
  updateProfile,
  validateAccountInfo,
  validateInvite,
} from './saga';
import {
  validateInvite as apiValidateInvite,
  createAccount as apiCreateAccount,
  createWeb3Account as apiCreateWeb3Account,
  completeAccount as apiCompleteAccount,
  uploadImage,
} from './api';
import { getZEROUsers as getZEROUsersAPI } from '../channels-list/api';
import { call, spawn } from 'redux-saga/effects';
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
import { Connectors } from '../../lib/web3';
import { getSignedTokenForConnector } from '../web3/saga';
import { completeUserLogin } from '../authentication/saga';
import { createConversation } from '../channels-list/saga';
import { denormalize as denormalizeUser } from '../users';
import { StoreBuilder } from '../test/store';
import { chat } from '../../lib/chat';

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
  });

  it('moves to the wallet account creation stage when invite code is valid', async () => {
    const code = '123456';

    const {
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

    expect(registration.stage).toEqual(RegistrationStage.WalletAccountCreation);
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
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.EmailAccountCreation, inviteCode }))
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
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.EmailAccountCreation }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.EmailAccountCreation);
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
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.EmailAccountCreation, inviteCode }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.EmailAccountCreation);
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
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.EmailAccountCreation, inviteCode }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.EmailAccountCreation);
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
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.EmailAccountCreation, inviteCode }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.EmailAccountCreation);
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
        initialState({ errors: ['existing_error'], stage: RegistrationStage.EmailAccountCreation, inviteCode })
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
          call(apiCompleteAccount, { userId: 'abc', name, inviteCode: 'INV123', profileImage: '' }),
          {
            success: true,
            response: {
              inviter: {
                id: 'inviter-id',
                matrixId: 'inviter-matrix-id',
              },
            },
          },
        ],
        [
          call(completeUserLogin),
          null,
        ],
        [matchers.call.fn(createWelcomeConversation), null],
        [
          call(createConversation, ['inviter-id'], '', null),
          null,
        ],
        [
          spawn(clearRegistrationStateOnLogout),
          null,
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

  it('updates the users profile image', async () => {
    const name = 'john';
    const image = { some: 'file' };
    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(updateProfile, { payload: { name, image } })
      .provide([
        [
          matchers.call.fn(uploadImage),
          { url: 'image-url' },
        ],
        [
          call(apiCompleteAccount, { userId: 'abc', name, inviteCode: 'INV123', profileImage: 'image-url' }),
          {
            success: true,
            response: {
              inviter: {
                id: 'inviter-id',
                matrixId: 'inviter-matrix-id',
              },
            },
          },
        ],
        [
          call(completeUserLogin),
          null,
        ],
        [
          call(createConversation, ['inviter-id'], '', null),
          null,
        ],
        [matchers.call.fn(createWelcomeConversation), null],
        [
          spawn(clearRegistrationStateOnLogout),
          null,
        ],
      ])
      .withReducer(
        rootReducer,
        initialState({ userId: 'abc', inviteCode: 'INV123', stage: RegistrationStage.ProfileDetails })
      )
      .call(uploadImage, image)
      .run();

    expect(registration.stage).toEqual(RegistrationStage.Done);
    expect(returnValue).toEqual(true);
  });

  it('sets error state if uploading the image fails', async () => {
    const name = 'john';
    const image = { some: 'file' };

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(updateProfile, { payload: { name, image } })
      .provide([
        [
          matchers.call.fn(uploadImage),
          throwError(new Error('Stub image upload error')),
        ],
      ])
      .withReducer(
        rootReducer,
        initialState({ userId: 'abc', inviteCode: 'INV123', stage: RegistrationStage.ProfileDetails })
      )
      .run();

    expect(registration.stage).toEqual(RegistrationStage.ProfileDetails);
    expect(registration.errors).toEqual([ProfileDetailsErrors.FILE_UPLOAD_ERROR]);
    expect(returnValue).toEqual(false);
  });

  it('sets error state if updating the profile fails', async () => {
    const name = 'john';

    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(updateProfile, { payload: { name } })
      .provide([
        [
          call(apiCompleteAccount, { userId: 'abc', name, inviteCode: 'INV123', profileImage: '' }),
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

  it('updates the first time login status', async () => {
    const name = 'john';

    const {
      storeState: { registration },
    } = await expectSaga(updateProfile, { payload: { name } })
      .provide([
        [
          call(apiCompleteAccount, { userId: 'abc', name, inviteCode: 'INV123', profileImage: '' }),
          { success: true },
        ],
        [
          call(completeUserLogin),
          null,
        ],
        [
          spawn(clearRegistrationStateOnLogout),
          null,
        ],
      ])
      .withReducer(
        rootReducer,
        initialState({
          isFirstTimeLogin: false,
          userId: 'abc',
          inviteCode: 'INV123',
          stage: RegistrationStage.ProfileDetails,
        })
      )
      .run();

    expect(registration.isFirstTimeLogin).toEqual(true);
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

describe('authorizeAndCreateWeb3Account', () => {
  it('creates a web3 account', async () => {
    const inviteCode = 'INV123';
    const signedToken = '0x9876';
    const {
      returnValue,
      storeState: { registration },
    } = await expectSaga(authorizeAndCreateWeb3Account, { payload: { connector: Connectors.Metamask } })
      .provide([
        [
          call(getSignedTokenForConnector, Connectors.Metamask),
          { success: true, token: signedToken },
        ],
        [
          call(apiCreateWeb3Account, { inviteCode, web3Token: signedToken }),
          { success: true, response: {} },
        ],
        [
          call(fetchCurrentUser),
          { id: '123' },
        ],
      ])
      .withReducer(rootReducer, initialState({ stage: RegistrationStage.WalletAccountCreation, inviteCode }))
      .run();

    expect(registration.stage).toEqual(RegistrationStage.ProfileDetails);
    expect(registration.userId).toEqual('123');
    expect(returnValue).toEqual(true);
  });
});

describe(createWelcomeConversation, () => {
  const chatClient = { userJoinedInviterOnZero: jest.fn() };

  function subject(...args: Parameters<typeof expectSaga>) {
    return expectSaga(...args).provide([
      [matchers.call.fn(getZEROUsersAPI), [{ userId: 'stub-id' }]],
      [matchers.call.fn(createConversation), { id: 'conversation-id' }],
      [matchers.call.fn(chat.get), chatClient],
    ]);
  }
  it('creates the welcome conversation between the inviter and new user', async () => {
    const initialState = new StoreBuilder();

    await subject(createWelcomeConversation, 'new-user-id', { id: 'inviter-id', matrixId: 'inviter-matrix-id' })
      .provide([[call(getZEROUsersAPI, ['inviter-matrix-id']), [{ userId: 'inviter-id', firstName: 'The inviter' }]]])
      .withReducer(rootReducer, initialState.build())
      .call(createConversation, ['inviter-id'], '', null)
      .call([chatClient, chatClient.userJoinedInviterOnZero], 'conversation-id', 'inviter-id', 'new-user-id')
      .run();
  });

  it('stores the inviter in state', async () => {
    const initialState = new StoreBuilder();

    const { storeState } = await subject(createWelcomeConversation, 'new-user-id', {
      id: 'inviter-id',
      matrixId: 'inviter-matrix-id',
    })
      .provide([[call(getZEROUsersAPI, ['inviter-matrix-id']), [{ userId: 'inviter-id', firstName: 'The inviter' }]]])
      .withReducer(rootReducer, initialState.build())
      .run();

    const savedUser = denormalizeUser('inviter-id', storeState);
    expect(savedUser).toEqual(expect.objectContaining({ userId: 'inviter-id', firstName: 'The inviter' }));
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
