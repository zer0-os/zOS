import { takeLatest, put, takeEvery, call, take, select } from 'redux-saga/effects';
import { SagaActionTypes, setConnectionStatus, setConnector, setWalletAddress, setWalletConnectionError } from '.';

import { ConnectionStatus, personalSignToken } from '../../lib/web3';
import { Web3Events, web3Channel } from './channels';
import { getWagmiConfig } from '../../lib/web3/wagmi-config';
import { getWalletClient } from '@wagmi/core';
import { WalletClient } from 'viem';

export function* isWeb3AccountConnected() {
  const state = yield select((state) => state.web3);
  return state.status === ConnectionStatus.Connected && state.value.address !== null;
}

export function* updateConnector(action) {
  yield put(setConnector(action.payload));
  yield put(setConnectionStatus(ConnectionStatus.Connecting));
}

export function* setAddress(action) {
  yield put(setWalletAddress(action.payload));

  const channel = yield call(web3Channel);
  yield put(channel, { type: Web3Events.AddressChanged, payload: action.payload });
}

export function* setConnectionError(action) {
  yield put(setWalletConnectionError(action.payload));

  if (action.payload) {
    // Publish a system message across the channel
    const channel = yield call(web3Channel);
    yield put(channel, { type: 'CONNECTION_ERROR', payload: action.payload });
  }
}

export function* getSignedToken(address = null) {
  const wagmiConfig = yield call(getWagmiConfig);
  const walletClient: WalletClient = yield call(getWalletClient, wagmiConfig);

  if (!address) {
    address = walletClient.account.address;
  }

  try {
    const token = yield call(personalSignToken, walletClient, address);
    return { success: true, token };
  } catch (error) {
    return { success: false, error: 'Wallet connection failed. Please try again.' };
  }
}

export function* waitForAddressChange() {
  const channel = yield call(web3Channel);
  const action = yield take(channel, Web3Events.AddressChanged);
  return action.payload;
}

export function* waitForError() {
  const channel = yield call(web3Channel);
  const action = yield take(channel, 'CONNECTION_ERROR');
  return action.payload;
}

export function* saga() {
  yield takeLatest(SagaActionTypes.UpdateConnector, updateConnector);
  yield takeEvery(SagaActionTypes.SetAddress, setAddress);
  yield takeEvery(SagaActionTypes.SetConnectionError, setConnectionError);
}
