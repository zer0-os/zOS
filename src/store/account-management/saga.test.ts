import { expectSaga } from '../../test/saga';
import {
  openWalletSelectModal,
  closeWalletSelectModal,
  linkNewWalletToZEROAccount,
  openAddEmailAccountModal,
  closeAddEmailAccountModal,
  addEmailToZEROAccount,
  updateCurrentUserPrimaryEmail,
} from './saga';
import { call } from 'redux-saga/effects';

import { setAddEmailAccountModalStatus, setWalletSelectModalStatus } from '.';
import { rootReducer } from '../reducer';
import { addEmailAccount } from '../registration/saga';
import { StoreBuilder } from '../test/store';

describe('openWalletSelectModal', () => {
  it('opens the wallet select modal', async () => {
    const initialState = new StoreBuilder().build();
    const { storeState } = await expectSaga(openWalletSelectModal)
      .withReducer(rootReducer, initialState)
      .put(setWalletSelectModalStatus(true))
      .run();

    expect(storeState.accountManagement.isWalletSelectModalOpen).toEqual(true);
  });
});

describe('closeWalletSelectModal', () => {
  it('closes the wallet select modal', async () => {
    const initialState = new StoreBuilder().withAccountManagement({ isWalletSelectModalOpen: true });

    const { storeState } = await expectSaga(closeWalletSelectModal)
      .withReducer(rootReducer, initialState.build())
      .put(setWalletSelectModalStatus(false))
      .run();

    expect(storeState.accountManagement.isWalletSelectModalOpen).toEqual(false);
  });
});

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

// todo: this will change when we have actual wallet select implementation
describe('linkNewWalletToZEROAccount', () => {
  it('closes the wallet select modal', async () => {
    const connector = 'MetaMask';
    const initialState = new StoreBuilder().withAccountManagement({ isWalletSelectModalOpen: true });
    const { storeState } = await expectSaga(linkNewWalletToZEROAccount, { payload: { connector } })
      .withReducer(rootReducer, initialState.build())
      .run();

    expect(storeState.accountManagement.isWalletSelectModalOpen).toEqual(false);
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
