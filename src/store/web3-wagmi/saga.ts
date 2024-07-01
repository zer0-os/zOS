import { takeLatest, put, takeEvery, call, take, select, race } from 'redux-saga/effects';
import { SagaActionTypes, setConnectionStatus, setConnector, setWalletAddress, setWalletConnectionError } from '.';

import { ConnectionStatus, Connectors, personalSignToken } from '../../lib/web3';
import { Web3Events, web3Channel } from './channels';
import { getService as getProviderService } from '../../lib/web3/provider-service';

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

export function* getSignedTokenForConnector(connector) {
  let current = yield select((state) => state.web3Wagmi.value);

  let address = current.address;
  if (current.connectorId !== connector || !current.address) {
    yield updateConnector({ payload: connector });
    const result = yield race({
      address: call(waitForAddressChange),
      error: call(waitForError),
    });
    if (result.error) {
      return { success: false, error: result.error };
    }
    address = result.address;
  }

  return yield call(getSignedToken, address);
}

export function* getSignedToken(address = null) {
  if (!address) {
    address = yield select((state) => state.web3Wagmi.value.address);
  }
  const providerService = yield call(getProviderService);
  try {
    const token = yield call(personalSignToken, providerService.get(), address);
    return { success: true, token };
  } catch (error) {
    yield updateConnector({ payload: Connectors.None });
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
