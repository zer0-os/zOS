import { expectSaga } from '../../test/saga';
import { openWalletSelectModal, closeWalletSelectModal, linkNewWalletToZEROAccount } from './saga';

import { WalletsState, initialState as initialWalletsState, setWalletSelectModalStatus } from '.';
import { rootReducer } from '../reducer';

describe('openWalletSelectModal', () => {
  it('opens the wallet select modal', async () => {
    const { storeState } = await expectSaga(openWalletSelectModal)
      .withReducer(rootReducer, initialState())
      .put(setWalletSelectModalStatus(true))
      .run();

    expect(storeState.wallets.isWalletSelectModalOpen).toEqual(true);
  });
});

describe('closeWalletSelectModal', () => {
  it('closes the wallet select modal', async () => {
    const { storeState } = await expectSaga(closeWalletSelectModal)
      .withReducer(rootReducer, initialState({ isWalletSelectModalOpen: true }))
      .put(setWalletSelectModalStatus(false))
      .run();

    expect(storeState.wallets.isWalletSelectModalOpen).toEqual(false);
  });
});

// todo: this will change when we have actual wallet select implementation
describe('linkNewWalletToZEROAccount', () => {
  it('closes the wallet select modal', async () => {
    const connector = 'MetaMask';

    const { storeState } = await expectSaga(linkNewWalletToZEROAccount, { payload: { connector } })
      .withReducer(rootReducer, initialState({ isWalletSelectModalOpen: true }))
      .run();

    expect(storeState.wallets.isWalletSelectModalOpen).toEqual(false);
  });
});

function initialState(attrs: Partial<WalletsState> = {}) {
  return {
    registration: {
      ...initialWalletsState,
      ...attrs,
    },
  } as any;
}
