import { expectSaga } from '../../test/saga';
import {
  openAddEmailAccountModal,
  closeAddEmailAccountModal,
  addEmailToZEROAccount,
  updateCurrentUserPrimaryEmail,
  linkNewWalletToZEROAccount,
  reset,
} from './saga';
import { call } from 'redux-saga/effects';

import { setAddEmailAccountModalStatus, State } from '.';
import { rootReducer } from '../reducer';
import { addEmailAccount } from '../registration/saga';
import { StoreBuilder } from '../test/store';
import { getSignedToken } from '../web3/saga';
import { linkNewWalletToZEROAccount as apiLinkNewWalletToZEROAccount } from './api';
import { throwError } from 'redux-saga-test-plan/providers';

describe('addEmailAccountModal', () => {
  it('opens the add email account modal', async () => {
    const initialState = new StoreBuilder().build();

    const { storeState } = await expectSaga(openAddEmailAccountModal)
      .withReducer(rootReducer, initialState)
      .put(setAddEmailAccountModalStatus(true))
      .run();

    expect(storeState.accountManagement.isAddEmailAccountModalOpen).toEqual(true);
  });

  it('closes the add email account modal', async () => {
    const initialState = new StoreBuilder().withAccountManagement({ isAddEmailAccountModalOpen: true });
    const { storeState } = await expectSaga(closeAddEmailAccountModal)
      .withReducer(rootReducer, initialState.build())
      .put(setAddEmailAccountModalStatus(false))
      .run();

    expect(storeState.accountManagement.isAddEmailAccountModalOpen).toEqual(false);
  });
});

describe(addEmailToZEROAccount, () => {
  it('close modal & sets success message when email is added successfully', async () => {
    const email = 'test@zero.tech';
    const password = 'passworD@av4321';
    const initialState = new StoreBuilder().build();

    const {
      storeState: { accountManagement },
    } = await expectSaga(addEmailToZEROAccount, { payload: { email, password } })
      .provide([
        [
          call(addEmailAccount, { email, password }),
          { success: true },
        ],
        [call(updateCurrentUserPrimaryEmail, email), {}],
      ])
      .withReducer(rootReducer, initialState)
      .call(closeAddEmailAccountModal)
      .run();

    expect(accountManagement.successMessage).toEqual('Email added successfully');
    expect(accountManagement.isAddEmailAccountModalOpen).toEqual(false);
  });

  it('updates current user primary email', async () => {
    const email = 'test@zero.tech';
    const password = 'passworD@av4321';

    const initialState = new StoreBuilder().withCurrentUser({
      id: 'user-id',
      profileSummary: { primaryEmail: null },
    } as any);

    const {
      storeState: { authentication },
    } = await expectSaga(addEmailToZEROAccount, { payload: { email, password } })
      .provide([
        [
          call(addEmailAccount, { email, password }),
          { success: true },
        ],
      ])
      .withReducer(rootReducer, initialState.build())
      .call(closeAddEmailAccountModal)
      .run();

    expect(authentication.user.data.profileSummary.primaryEmail).toEqual(email);
  });

  it('does not close modal & sets error message when email is not added successfully', async () => {
    const email = 'test@zero.tech';
    const password = 'passworD@av4321';

    const initialState = new StoreBuilder()
      .withCurrentUser({
        id: 'user-id',
        profileSummary: { primaryEmail: null },
      } as any)
      .withAccountManagement({ isAddEmailAccountModalOpen: true })
      .build();

    const {
      storeState: { accountManagement, authentication },
    } = await expectSaga(addEmailToZEROAccount, { payload: { email, password } })
      .provide([
        [
          call(addEmailAccount, { email, password }),
          { success: false, error: 'something' },
        ],
      ])
      .withReducer(rootReducer, initialState)
      .run();

    expect(accountManagement.successMessage).toEqual('');
    expect(accountManagement.isAddEmailAccountModalOpen).toEqual(true);
    expect(authentication.user.data.profileSummary.primaryEmail).toEqual(null);
  });
});

describe(linkNewWalletToZEROAccount, () => {
  it('calls reset initially, and sets error if getSignedToken fails', async () => {
    const initialState = new StoreBuilder().build();

    const {
      storeState: { accountManagement },
    } = await expectSaga(linkNewWalletToZEROAccount)
      .provide([
        [
          call(getSignedToken),
          { success: false, error: 'failed to connect to metamask' },
        ],
      ])
      .withReducer(rootReducer, initialState)
      .call(reset)
      .run();

    expect(accountManagement.state).toEqual(State.LOADED);
    expect(accountManagement.errors).toEqual(['failed to connect to metamask']);
  });

  it('calls apiAddNewWallet with token', async () => {
    const initialState = new StoreBuilder().build();

    await expectSaga(linkNewWalletToZEROAccount)
      .provide([
        [call(getSignedToken), { success: true, token: 'some_token' }],
        [call(apiLinkNewWalletToZEROAccount, 'some_token'), { success: true, response: { wallet: 'some_wallet' } }],
      ])
      .withReducer(rootReducer, initialState)
      .call(apiLinkNewWalletToZEROAccount, 'some_token')
      .run();
  });

  it('sets API error if apiAddNewWallet fails', async () => {
    const initialState = new StoreBuilder()
      .withAccountManagement({ state: State.NONE, errors: ['unknown_error_1'] })
      .build();

    const {
      storeState: { accountManagement },
    } = await expectSaga(linkNewWalletToZEROAccount)
      .provide([
        [call(getSignedToken), { success: true, token: 'some_token' }],
        [call(apiLinkNewWalletToZEROAccount, 'some_token'), { success: false, error: 'failed to link wallet' }],
      ])
      .withReducer(rootReducer, initialState)
      .run();

    expect(accountManagement.state).toEqual(State.LOADED);
    expect(accountManagement.errors).toEqual(['failed to link wallet']);
  });

  it('sets unknown error if apiAddNewWallet throws an error', async () => {
    const initialState = new StoreBuilder().build();

    const {
      storeState: { accountManagement },
    } = await expectSaga(linkNewWalletToZEROAccount)
      .provide([
        [call(getSignedToken), { success: true, token: 'some_token' }],
        [call(apiLinkNewWalletToZEROAccount, 'some_token'), throwError(new Error('some error'))],
      ])
      .withReducer(rootReducer, initialState)
      .run();

    expect(accountManagement.state).toEqual(State.LOADED);
    expect(accountManagement.errors).toEqual(['UNKNOWN_ERROR']);
  });

  it('adds wallet to current user state and puts success message if added successfully', async () => {
    const initialState = new StoreBuilder()
      .withCurrentUser({
        id: 'user-id',
        profileSummary: { primaryEmail: 'test@zero.tech', wallets: [] },
      } as any)
      .build();

    const {
      storeState: {
        accountManagement,
        authentication: { user },
      },
    } = await expectSaga(linkNewWalletToZEROAccount)
      .provide([
        [call(getSignedToken), { success: true, token: 'some_token' }],
        [
          call(apiLinkNewWalletToZEROAccount, 'some_token'),
          { success: true, response: { wallet: { id: 'wallet_id', publicAddress: 'some_wallet_address' } } },
        ],
      ])
      .withReducer(rootReducer, initialState)
      .run();

    expect(accountManagement.errors).toEqual([]);
    expect(accountManagement.successMessage).toEqual('Wallet added successfully');
    expect(user.data.wallets).toStrictEqual([{ id: 'wallet_id', publicAddress: 'some_wallet_address' }]);
  });

  it('updates primaryZID if provided in response', async () => {
    const initialState = new StoreBuilder()
      .withCurrentUser({
        id: 'user-id',
        profileSummary: { primaryEmail: 'test@zero.tech', wallets: [] },
      } as any)
      .build();

    const {
      storeState: {
        authentication: { user },
      },
    } = await expectSaga(linkNewWalletToZEROAccount)
      .provide([
        [call(getSignedToken), { success: true, token: 'some_token' }],
        [
          call(apiLinkNewWalletToZEROAccount, 'some_token'),
          {
            success: true,
            response: {
              wallet: { id: 'wallet_id', publicAddress: 'some_wallet_address' },
              primaryZID: '0://developer',
            },
          },
        ],
      ])
      .withReducer(rootReducer, initialState)
      .run();

    expect(user.data.primaryZID).toEqual('0://developer');
  });

  it('derives primaryZID from publicAddress if not provided in response', async () => {
    const initialState = new StoreBuilder()
      .withCurrentUser({
        id: 'user-id',
        profileSummary: { primaryEmail: 'test@zero.tech', wallets: [] },
      } as any)
      .build();

    const {
      storeState: {
        authentication: { user },
      },
    } = await expectSaga(linkNewWalletToZEROAccount)
      .provide([
        [call(getSignedToken), { success: true, token: 'some_token' }],
        [
          call(apiLinkNewWalletToZEROAccount, 'some_token'),
          {
            success: true,
            response: {
              wallet: { id: 'wallet_id', publicAddress: '0x64afb118ee48b732179be1c471537e2a6d4a63fe' },
              primaryZID: null,
            },
          },
        ],
      ])
      .withReducer(rootReducer, initialState)
      .run();

    expect(user.data.primaryZID).toEqual('0x64af...63fe');
  });
});
