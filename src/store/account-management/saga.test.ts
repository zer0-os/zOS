import { expectSaga } from '../../test/saga';
import {
  openWalletSelectModal,
  closeWalletSelectModal,
  linkNewWalletToZEROAccount,
  openAddEmailAccountModal,
  closeAddEmailAccountModal,
} from './saga';

import {
  AccountManagementState,
  initialState as intialAccountManagementState,
  setAddEmailAccountModalStatus,
  setWalletSelectModalStatus,
} from '.';
import { rootReducer } from '../reducer';

describe('openWalletSelectModal', () => {
  it('opens the wallet select modal', async () => {
    const { storeState } = await expectSaga(openWalletSelectModal)
      .withReducer(rootReducer, initialState())
      .put(setWalletSelectModalStatus(true))
      .run();

    expect(storeState.accountManagement.isWalletSelectModalOpen).toEqual(true);
  });
});

describe('closeWalletSelectModal', () => {
  it('closes the wallet select modal', async () => {
    const { storeState } = await expectSaga(closeWalletSelectModal)
      .withReducer(rootReducer, initialState({ isWalletSelectModalOpen: true }))
      .put(setWalletSelectModalStatus(false))
      .run();

    expect(storeState.accountManagement.isWalletSelectModalOpen).toEqual(false);
  });
});

describe('addEmailAccountModal', () => {
  it('opens the add email account modal', async () => {
    const { storeState } = await expectSaga(openAddEmailAccountModal)
      .withReducer(rootReducer, initialState())
      .put(setAddEmailAccountModalStatus(true))
      .run();

    expect(storeState.accountManagement.isAddEmailAccountModalOpen).toEqual(true);
  });

  it('closes the add email account modal', async () => {
    const { storeState } = await expectSaga(closeAddEmailAccountModal)
      .withReducer(rootReducer, initialState({ isAddEmailAccountModalOpen: true }))
      .put(setAddEmailAccountModalStatus(false))
      .run();

    expect(storeState.accountManagement.isAddEmailAccountModalOpen).toEqual(false);
  });
});

// todo: this will change when we have actual wallet select implementation
describe('linkNewWalletToZEROAccount', () => {
  it('closes the wallet select modal', async () => {
    const connector = 'MetaMask';

    const { storeState } = await expectSaga(linkNewWalletToZEROAccount, { payload: { connector } })
      .withReducer(rootReducer, initialState({ isWalletSelectModalOpen: true }))
      .run();

    expect(storeState.accountManagement.isWalletSelectModalOpen).toEqual(false);
  });
});

function initialState(attrs: Partial<AccountManagementState> = {}) {
  return {
    accountManagement: {
      ...intialAccountManagementState,
      ...attrs,
    },
  } as any;
}
