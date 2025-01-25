import { call, put, select, spawn, take } from 'redux-saga/effects';
import { currentUserSelector } from '../authentication/saga';
import { Events as AuthEvents, getAuthChannel } from '../authentication/channels';

import { Account, inAppWallet, SmartWalletOptions } from 'thirdweb/wallets';

import { linkThirdwebWallet } from './api';
import { accountManager } from './account-manager';
import { getChain, getThirdWebClient } from '../../lib/web3/thirdweb/client';
import { setUser } from '../authentication';

export function* getLinkedThirdWebWallet() {
  const currentUser = yield select(currentUserSelector());

  // Early return if no user or wallets
  if (!currentUser?.wallets) {
    return null;
  }

  return currentUser.wallets.find((wallet): boolean => wallet?.isThirdWeb === true) || null;
}

export function* initThirWebWallet() {
  try {
    // Get existing wallet if any
    const linkedThirdwebWallet = yield call(getLinkedThirdWebWallet);
    const currentUser = yield select(currentUserSelector());

    // Validate user exists
    if (!currentUser?.id) {
      console.warn('Error occurred during initThirWebWallet: No authenticated user found');
      return;
    }

    // Initialize client and chain
    const client = yield call(getThirdWebClient);
    const chain = getChain();

    // Configure wallet options
    const opts: { smartAccount: SmartWalletOptions } = {
      smartAccount: {
        chain,
        sponsorGas: true,
        ...(linkedThirdwebWallet && {
          overrides: {
            accountAddress: linkedThirdwebWallet.publicAddress,
          },
        }),
      },
    };

    // Initialize and connect wallet
    const wallet = inAppWallet(opts);
    const account: Account = yield call([wallet, wallet.connect], {
      client,
      strategy: 'auth_endpoint',
      payload: JSON.stringify({ userId: currentUser.id }),
    });

    // Link wallet if not already linked
    if (!linkedThirdwebWallet && account?.address) {
      const response = yield call(linkThirdwebWallet, {
        walletAddress: account.address,
      });

      if (response?.wallet) {
        yield call(updateCurrentUserWallets, response.wallet);
      }
    }

    // Store account instance
    if (account) {
      accountManager.setAccount(account);
      console.log('Thirdweb Account initialized:', account.address);
    }
  } catch (error) {
    console.error('Error initializing ThirWebWallet:', error);
  }
}

export function* updateCurrentUserWallets(wallet) {
  const currentUser = yield select(currentUserSelector());

  if (!wallet || !wallet.publicAddress) {
    return; // Ensure wallet has a valid publicAddress
  }

  // Update wallets immutably
  const updatedWallets = [...(currentUser.wallets || []), wallet];

  yield put(
    setUser({
      data: {
        ...currentUser,
        wallets: updatedWallets,
      },
    })
  );
}

function* listenForUserLogin() {
  const userChannel = yield call(getAuthChannel);
  while (true) {
    yield take(userChannel, AuthEvents.UserLogin);
    yield call(initThirWebWallet);
  }
}

export function* saga() {
  yield spawn(listenForUserLogin);
}
